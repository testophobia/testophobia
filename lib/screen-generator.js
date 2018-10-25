/* global global, require, __dirname, querySelectorShadowDom, exports */
const puppeteer = require('puppeteer');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const {ScreenBase} = require('./screen-base');
const {ScreenCompare} = require('./screen-compare');
const {Logger} = require('./utils');
const sharp = require('sharp');
const {asyncForEach} = require("./utils");

const log = new Logger(Logger.INFO_LEVEL);

exports.ScreenGenerator = class ScreenGenerator extends ScreenBase {
  constructor(config, isGolden, tests) {
    super(config, tests);
    this.initialConfig = config;
    this.testResults = [];
    this.isGolden = isGolden;
    if (config.verbose) log.setLevel(Logger.DEBUG_LEVEL);
  }

  async run() {
    this.currentTest = 0;
    this.spinner = new ora();
    this.updateSpinnerDisplay();
    await asyncForEach(this.tests, async t => {
      if ((this.bail && this.testResults.length)) return;
      let testRouteName = t.name.split('.')[0];
      this.test = t;
      await this.createDirectories(testRouteName);
      await asyncForEach(this.dimensions, async d => {
        ++this.currentTest;
        await this.handleScreenshot(d.type, testRouteName);
        if (!this.isGolden) {
          this.prependDebugMessageToSpinner(`Comparing Screenshots - ${testRouteName} (${d.type})`);
          let resp = await this.compareScreenshot(d);
          this.testResults.push.apply(this.testResults, resp);
          if (resp.length) this.prependDebugMessageToSpinner('Screenshot was not a match!');
        }
      });
      this.updateSpinnerDisplay();
    });
    const bailTriggered = this.bail && Boolean(this.testResults.length);
    if (bailTriggered) {
      this.updateSpinnerDisplay(true);
      this.spinner.fail();
    } else {
      this.spinner.succeed();
    }
    return {tests: this.tests.map(t => t.name), failures: this.testResults, bailTriggered};
  }

  async createDirectories(testRouteName) {
    if (!this.isGolden && !fs.existsSync(`${this.diffDirectory}/`)) mkdirp(`${this.diffDirectory}`);
    this.dirToUse = this.isGolden ? this.goldenDirectory : this.testDirectory;
    await asyncForEach(this.dimensions, d => {
      if (global.response) return global.response;
      if (!this.isGolden && !fs.existsSync(`${this.goldenDirectory}/${d.type}/${testRouteName}`)) {
        this.spinner.fail();
        log.fatal('Error: Missing Golden Images');
      }
      if (!fs.existsSync(`${this.dirToUse}/${d.type}/${testRouteName}`)) mkdirp(`${this.dirToUse}/${d.type}/${testRouteName}`);
      global.response = 0;
    });
    return global.response;
  }

  prependDebugMessageToSpinner(message) {
    this.spinner.stop();
    log.debug(message);
    this.updateSpinnerDisplay();
  }

  updateSpinnerDisplay(bailTriggered) {
    if (!this.spinner.isSpinning) this.spinner.start();
    const total = this.calculateTotalTests();
    const failed = (this.testResults && this.testResults.length) || 0;
    const passed = this.currentTest - failed;
    const pending = total - (passed + failed);
    let prefix;
    let doneText = (this.isGolden) ? 'done' : 'passed';
    if (this.isGolden)
      prefix = chalk.cyan((pending) ? 'Generating Goldens' : 'Generation Complete');
    else
      prefix = chalk.cyan((pending) ? 'Running Tests' : 'Testing Complete');
    if (bailTriggered) prefix = chalk.cyan('Bailed');
    this.spinner.text = ` ${prefix} [${chalk.green(`${passed} ${doneText}`)}` +
      ((this.isGolden) ? '' : ` | ${chalk.red(`${failed} failed`)}`) +
      `${(pending) ? ` | ${pending} pending` : ''}]`;
  }

  calculateTotalTests() {
    let total = 0;
    this.tests.map(r => total += r.actions ? 1 + r.actions.filter(b => !b.skipScreen).length : 1);
    total *= this.dimensions.length;
    return total;
  }

  async handleScreenshot(screenType, testRouteName) {
    this.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${screenType})`);
    let browser = await puppeteer.launch();
    this.page = await browser.newPage();
    let dimensions = this.handleScreenDimensions(screenType);
    await this.page.setViewport(dimensions);
    await this.takeScreenshot(screenType, testRouteName, dimensions);
    browser.close();
  }

  compareScreenshot(dimension) {
    const sc = new ScreenCompare(this.initialConfig, this.test, dimension);
    return sc.run();
  }

  handleScreenDimensions(screenType) {
    return this.dimensions.find(d => d.type === screenType);
  }

  async takeScreenshot(screenType, testRouteName, dimensions) {
    const fileName = screenType + '/' + (testRouteName ? testRouteName : 'home');
    const url = `${this.baseUrl}${this.test.path ? '/' + this.test.path.replace(/^\/+/g, '') : ''}`;
    try {
      await this.page.goto(url, {waitUntil: 'networkidle0'});
    } catch (err) {
      this.spinner.fail();
      log.fatal('Error: baseUrl supplied cannot be reached.');
    }
    const options = {
      path: `${this.dirToUse}/${fileName}/screen.${this.fileType}`,
      type: this.fileType
    };
    if (this.fileType === 'jpeg') options.quality = this.quality;
    if (this.test.delay) await this.waitForRender(this.test.delay);
    await this.page.screenshot(options);
    await this._optimizeImages(`${this.dirToUse}/${fileName}/screen.${this.fileType}`, dimensions);
    if (this.test.actions) {
      await asyncForEach(this.test.actions, async b => {await this.handleAction(`${fileName}`, b, dimensions, testRouteName, screenType);});
    }
  }

  addSelectorScript() {
    return this.page.addScriptTag({
      path: path.join(
        __dirname,
        '../node_modules/query-selector-shadow-dom/dist/querySelectorShadowDom.js'
      )
    });
  }

  async handleAction(f, b, dimensions, testRouteName, screenType) {
    if (!b.target) {
      global.response = 1;
      return log.error('Targets are required for actions.', 'red');
    }
    let targetName = this.cleanTargetName(b.target);
    try {
      await this.performAction(b);
    } catch (err) {
      global.response = 1;
      this.spinner.fail();
      log.fatal(`Error: Issue performing action: ${b.type} for test: ${this.test.name}`);
    }
    let options = {
      path: `${this.dirToUse}/${f}/${b.type}-${targetName}-screen.${this.fileType}`,
      type: this.fileType
    };
    if (this.fileType === 'jpeg') options.quality = this.quality;
    if (!b.skipScreen) {
      ++this.currentTest;
      this.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${screenType}-${b.type}-${targetName})`);
      await this.page.screenshot(options);
      await this._optimizeImages(`${this.dirToUse}/${f}/${b.type}-${targetName}-screen.${this.fileType}`, dimensions);
    }
  }

  async performAction(b) {
    await this.addSelectorScript();
    let res = await this.page.evaluateHandle(config => {
      const element = querySelectorShadowDom.querySelectorDeep(`${config.el}`);
      if (element) {
        switch (config.action) {
          case 'setProperty':
            element[config.property] = config.value;
            return;
          case 'setAttribute':
            element.setAttribute(config.attribute, config.value);
            return;
          case 'removeAttribute':
            element.removeAttribute(config.attribute);
            return;
          case 'hover':
            return element;
          case 'keypress':
            let e = new Event('keypress');
            e.keyCode = config.keyCode;
            e.which = e.keyCode;
            element.dispatchEvent(e);
            return;
          case 'scroll':
            return config.scrollTop ? element.scrollTop = config.scrollTop : element.scrollLeft = config.scrollLeft;
          default:
            element[config.action]();
        }
      }
    }, {el: b.target, action: b.type, property: b.property, value: b.value, scrollTop: b.scrollTop, scrollLeft: b.scrollLeft, attribute: b.attribute, keyCode: b.keyCode});
    if (b.type === 'hover') {
      res.asElement().hover();
      if (res.focus) res.focus();
    }
    if (b.delay) await this.page.waitFor(b.delay);
  }

  waitForRender(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async _optimizeImages(path, dimensions) {
    const oldPath = path;
    const width = dimensions.scale ? Math.floor(dimensions.width * dimensions.scale) : dimensions.width;
    const height = dimensions.scale ? Math.floor(dimensions.height * dimensions.scale) : dimensions.height;
    await sharp(path)
      .resize(width, height, {
        fastShrinkOnLoad: false
      })
      .toFile(path.replace('.png', '-scaled.png').replace('.jpeg', '-scaled.jpeg'));
    return fs.unlink(oldPath, err => {
      if (err) {
        log.error(err, 'red');
        global.response = 1;
      }
      global.response = 0;
    });
  }
};
