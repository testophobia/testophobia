/* global global, require, querySelectorShadowDom, exports, lolex */
const puppeteer = require('puppeteer');
const fs = require('fs');
const mkdirp = require('mkdirp');
const ora = require('ora');
const chalk = require('chalk');
const figures = require('figures');
const {ScreenBase} = require('./screen-base');
const {ScreenCompare} = require('./screen-compare');
const {Logger, resolveNodeModuleFile, asyncForEach} = require('./utils');
const sharp = require('sharp');

const log = new Logger(Logger.INFO_LEVEL);
sharp.cache(false);

exports.ScreenGenerator = class ScreenGenerator extends ScreenBase {
  constructor(config, isGolden, tests) {
    super(config, tests);
    this.initialConfig = config;
    this.testResults = [];
    this.isGolden = isGolden;
    if (config.verbose || config.debug) log.setLevel(Logger.DEBUG_LEVEL);
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
        if ((this.bail && this.testResults.length)) return;
        await this.handleScreenshot(d.type, testRouteName);
        if (!this.isGolden) {
          this.prependDebugMessageToSpinner(`Comparing Screenshots - ${testRouteName} (${d.type})`);
          let resp = await this.compareScreenshot(d);
          this.testResults.push.apply(this.testResults, resp);
          if (resp.length) this.prependDebugMessageToSpinner('Screenshot was not a match!');
        }
        ++this.currentTest;
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
      if (!this.isGolden && !fs.existsSync(`${this.goldenDirectory}/${d.type}/${testRouteName}`)) {
        this.spinner.fail();
        log.fatal(figures.cross + '  Missing Golden Images');
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

  async updateSpinnerDisplay(bailTriggered) {
    if (!this.spinner.isSpinning) this.spinner.start();
    const total = await this.calculateTotalTests();
    const failed = (this.testResults && this.testResults.length) || 0;
    const passed = Math.max(this.currentTest - failed, 0);
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
    this.tests.map(t => total += t.actions ? this.dimensions.length + this.resolveActionCounts(t) : this.dimensions.length);
    return total;
  }

  resolveActionCounts(test) {
    let count = 0;
    test.actions.forEach(a => {
      count += a.skipScreen ? 0 : a.excludeDimensions ? (this.dimensions.length - a.excludeDimensions.length) : this.dimensions.length;
    });
    return count;
  }

  async handleScreenshot(screenType, testRouteName) {
    this.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${screenType})`);
    let puppeteerOptions = {ignoreDefaultArgs: ['--hide-scrollbars']};
    if (this.debug) puppeteerOptions = Object.assign({}, {headless: false, slowMo: 250}, puppeteerOptions);
    let browser = await puppeteer.launch(puppeteerOptions);
    this.page = await browser.newPage();
    if (this.debug) this.page.on('console', msg => log.debug(`\nCHROMIUM LOG: ${msg.text()}`));
    browser.on('targetchanged', async () => {
      await this.addScript("/node_modules/lolex/lolex.js");
      this.setBrowserDate();
    });
    let dimensions = this.handleScreenDimensions(screenType);
    await this.page.setViewport(dimensions);
    await this.takeScreenshot(screenType, testRouteName, dimensions);
    browser.close();
  }

  setBrowserDate() {
    if (this.page) {
      return this.page.evaluateHandle(time => {
        let mockDate = lolex.createClock(time);
        window.Date = mockDate.Date;
      }, this.defaultTime);
    }
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
    this.prependDebugMessageToSpinner(` - url: ${url}`);
    try {
      await this.page.goto(url, {waitUntil: 'networkidle0'});
    } catch (err) {
      this.spinner.fail();
      log.fatal(figures.cross + '  baseUrl supplied cannot be reached.');
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

  async addScript(pathToUse) {
    pathToUse = await resolveNodeModuleFile(pathToUse);
    if (this.page) {
      return this.page.addScriptTag({
        path: pathToUse
      });
    }
  }

  async handleAction(f, b, dimensions, testRouteName, screenType) {
    if (b.excludeDimensions && b.excludeDimensions.includes(screenType)) return;
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
      log.fatal(figures.cross + `  Issue performing action: ${b.type} for test: ${this.test.name}`);
    }
    if (!b.skipScreen) {
      let options = {
        path: `${this.dirToUse}/${f}/${b.type}-${targetName}-screen.${this.fileType}`,
        type: this.fileType
      };
      if (this.fileType === 'jpeg') options.quality = this.quality;
      this.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${screenType}-${b.type}-${targetName})`);
      await this.page.screenshot(options);
      await this._optimizeImages(`${this.dirToUse}/${f}/${b.type}-${targetName}-screen.${this.fileType}`, dimensions);
      ++this.currentTest;
    }
  }

  async performAction(b) {
    await this.addScript("/node_modules/query-selector-shadow-dom/dist/querySelectorShadowDom.js");
    let res = await this.page.evaluateHandle(config => {
      const element = querySelectorShadowDom.querySelectorDeep(`${config.el}`);
      if (element) {
        switch (config.action) {
          case 'setProperty':
            element[config.property] = config.value;
            return element;
          case 'setAttribute':
            element.setAttribute(config.attribute, config.value);
            return element;
          case 'removeAttribute':
            element.removeAttribute(config.attribute);
            return element;
          case 'hover':
            return element;
          case 'keypress':
            let events = [new Event('keydown'), new Event('keypress'), new Event('keyup')];
            events.forEach(e => {
              e.key = config.key;
              e.which = e.key;
              element.dispatchEvent(e);
            });
            return element;
          case 'scroll':
            config.scrollTop ? element.scrollTop = config.scrollTop : element.scrollLeft = config.scrollLeft;
            return element;
          default:
            element[config.action]();
            return element;
        }
      }
    }, {el: b.target, action: b.type, property: b.property, value: b.value, scrollTop: b.scrollTop, scrollLeft: b.scrollLeft, attribute: b.attribute, key: b.key});
    if (b.type === 'hover') {
      res.asElement().hover();
      if (res.focus) res.focus();
    }
    if (b.type === 'click') {
      try {
        let {x, y} = await res.asElement().boundingBox();
        this.page.mouse.move(x, y);
      } catch (err) {
        this.prependDebugMessageToSpinner(`Unable to move mouse to element for ${this.test.name} - ${b.type} - ${b.target}`);
      }
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
