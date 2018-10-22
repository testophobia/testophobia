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
  constructor(config, isGolden, testRoutes) {
    super(config, testRoutes);
    this.isGolden = isGolden;
  }

  async run() {
    this.currentTest = 0;
    let start = new Date();
    this.spinner = this.prepareCliDisplay();
    await this.asyncForEach(this.routes, async f => {
      let routeName = f.name.split(".")[0];
      this.route = f;
      await this.createDirectories(routeName);
      await this.asyncForEach(this.dimensions, async d => {
        ++this.currentTest;
        this.updateSpinnerDisplay();
        await this.handleScreenshot(d.type, routeName);
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
    this.routes.map(r => total += r.actions ? 1 + r.actions.filter(b => !b.skipScreen).length : 1);
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

  async createDirectories(routeName) {
    this.dirToUse = this.isGolden ? this.goldenDirectory : this.testDirectory;
    await this.asyncForEach(this.dimensions, d => {
      if (!fs.existsSync(`${this.dirToUse}/${d.type}/${routeName}`))
        if (
          !this.isGolden &&
          !fs.existsSync(`${this.goldenDirectory}/${d.type}/${routeName}`)
        ) {
          global.response = 1;
        }
      mkdirp(`${this.dirToUse}/${d.type}/${routeName}`);
    });
    if (!this.isGolden && !fs.existsSync(`${this.diffDirectory}/`))
      mkdirp(`${this.diffDirectory}`);
  }

  async handleScreenshot(view, routeName) {
    let browser = await puppeteer.launch();
    this.page = await browser.newPage();
    let dimensions = this.handleScreenDimensions(view);
    await this.page.setViewport(dimensions);
    await this.takeScreenshot(view, routeName, dimensions);
    browser.close();
  }

  handleScreenDimensions(view) {
    return this.dimensions.find(d => d.type === view);
  }

  async takeScreenshot(view, routeName, dimensions) {
    let fileName = view + "/" + (routeName ? routeName : "home");
    await this.page.goto(
      `${this.baseUrl}/${this.route.path ? this.route.path : routeName}`, {waitUntil: 'networkidle0'}
    );
    let options = {
      path: `${this.dirToUse}/${fileName}/screen.${this.fileType}`,
      type: this.fileType
    };
    if (this.fileType === "jpeg") options.quality = this.quality;
    if (this.route.delay) await this.waitForRender(this.route.delay);
    await this.page.screenshot(options);
    await this._optimizeImages(`${this.dirToUse}/${fileName}/screen.${this.fileType}`, dimensions);
    if (this.route.actions) {
      await this.asyncForEach(this.route.actions, async b => {await this.handleAction(`${fileName}`, b, dimensions);}
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
          case 'input':
            element[config.property] = config.text;
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
    const dimensionsRatio = 1.71;
    const width = dimensions.compressed ? dimensions.compressed.width : Math.floor(dimensions.width / dimensionsRatio);
    const height = dimensions.compressed ? dimensions.compressed.height : Math.floor(dimensions.height / dimensionsRatio);
    await sharp(path)
      .resize(width, height, {
        fastShrinkOnLoad: false
      })
      .toFile(path.replace('.png', '-compressed.png').replace('.jpeg', '-compressed.jpeg'));
    return fs.unlink(oldPath, err => {
      global.response = 1;
      if (err) console.log(err);
    });
  }
};
