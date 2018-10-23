/* global global, require, __dirname, querySelectorShadowDom, exports */
const puppeteer = require("puppeteer");
const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const chalk = require("chalk");
const ora = require("ora");
const {ScreenBase} = require("./screen-base");
const sharp = require('sharp');

exports.ScreenGenerator = class ScreenGenerator extends ScreenBase {
  constructor(config, isGolden, tests) {
    super(config, tests);
    this.isGolden = isGolden;
  }

  async run() {
    this.currentTest = 0;
    let start = new Date();
    this.spinner = this.prepareCliDisplay();
    await this.asyncForEach(this.tests, async t => {
      let testRouteName = t.name.split(".")[0];
      this.test = t;
      await this.createDirectories(testRouteName);
      await this.asyncForEach(this.dimensions, async d => {
        ++this.currentTest;
        this.updateSpinnerDisplay();
        await this.handleScreenshot(d.type, testRouteName);
      });
    });
    this.handleEndDisplay(start);
    return;
  }

  prepareCliDisplay() {
    let spinner = new ora();
    spinner.start();
    return spinner;
  }

  updateSpinnerDisplay() {
    let total = this.calculateTotalTests();
    this.spinner.text = `Generating ${
      this.isGolden ? "golden" : "test"
      } screens ${this.currentTest}/${total} ...\n`;
  }

  calculateTotalTests() {
    let total = 0;
    this.tests.map(r => total += r.actions ? 1 + r.actions.filter(b => !b.skipScreen).length : 1);
    total *= this.dimensions.length;
    return total;
  }

  handleEndDisplay(start) {
    let end = new Date() - start;
    let message = chalk.cyan(
      `Finished generating ${this.isGolden ? "golden" : "test"} screens! (${(
        end / 1000
      ).toFixed(1)}s)`
    );
    this.endSpinner(message);
  }

  endSpinner(message) {
    this.spinner.succeed(message);
  }

  async createDirectories(testRouteName) {
    this.dirToUse = this.isGolden ? this.goldenDirectory : this.testDirectory;
    await this.asyncForEach(this.dimensions, d => {
      if (!fs.existsSync(`${this.dirToUse}/${d.type}/${testRouteName}`))
        if (
          !this.isGolden &&
          !fs.existsSync(`${this.goldenDirectory}/${d.type}/${testRouteName}`)
        ) {
          global.response = 1;
        }
      mkdirp(`${this.dirToUse}/${d.type}/${testRouteName}`);
    });
    if (!this.isGolden && !fs.existsSync(`${this.diffDirectory}/`))
      mkdirp(`${this.diffDirectory}`);
  }

  async handleScreenshot(view, testRouteName) {
    let browser = await puppeteer.launch();
    this.page = await browser.newPage();
    let dimensions = this.handleScreenDimensions(view);
    await this.page.setViewport(dimensions);
    await this.takeScreenshot(view, testRouteName, dimensions);
    browser.close();
  }

  handleScreenDimensions(view) {
    return this.dimensions.find(d => d.type === view);
  }

  async takeScreenshot(view, testRouteName, dimensions) {
    let fileName = view + "/" + (testRouteName ? testRouteName : "home");
    await this.page.goto(
      `${this.baseUrl}/${this.test.path ? this.test.path.replace(/^\/+/g, '') : testRouteName}`, {waitUntil: 'networkidle0'}
    );
    let options = {
      path: `${this.dirToUse}/${fileName}/screen.${this.fileType}`,
      type: this.fileType
    };
    if (this.fileType === "jpeg") options.quality = this.quality;
    if (this.test.delay) await this.waitForRender(this.test.delay);
    await this.page.screenshot(options);
    await this._optimizeImages(`${this.dirToUse}/${fileName}/screen.${this.fileType}`, dimensions);
    if (this.test.actions) {
      await this.asyncForEach(this.test.actions, async b => {await this.handleAction(`${fileName}`, b, dimensions);}
      );
    }
    return;
  }

  addSelectorScript() {
    return this.page.addScriptTag({
      path: path.join(
        __dirname,
        "../node_modules/query-selector-shadow-dom/dist/querySelectorShadowDom.js"
      )
    });
  }

  async handleAction(f, b, dimensions) {
    if (!b.target) {
      global.response = 1;
      return console.log(chalk.red("Targets are required for actions."));
    }
    let targetName = this.cleanTargetName(b.target);
    await this.performAction(b);
    let options = {
      path: `${this.dirToUse}/${f}/${b.type}-${targetName}-screen.${this.fileType}`,
      type: this.fileType
    };
    if (this.fileType === "jpeg") options.quality = this.quality;
    if (!b.skipScreen) {
      ++this.currentTest;
      this.updateSpinnerDisplay();
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
          case 'hover':
            return element;
          case 'scroll':
            return element.scrollTop = config.scrollTop;
          default:
            element[config.action]();
        }
      }
    }, {el: b.target, action: b.type, property: b.property, text: b.text, scrollTop: b.scrollTop});
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
        console.log(err);
        global.response = 1;
      }
      global.response = 0;
    });
  }
};
