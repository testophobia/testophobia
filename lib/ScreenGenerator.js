/* global global, require, exports */
const {Browser} = require('./Browser');
const fs = require('fs');
const {ScreenBase} = require('./ScreenBase');
const {ScreenCompare} = require('./ScreenCompare');
const {asyncForEach, deleteFile, createDirectory} = require('./utils');
const {optimizeImage} = require('./utils/optimize-image');
const {Output} = require('./Output');

exports.ScreenGenerator = class ScreenGenerator extends ScreenBase {
  constructor(config, tests) {
    super(config, tests);
    this.initialConfig = config;
    this.testResults = [];
    this.output = new Output(config, this.tests);
  }

  async run() {
    await asyncForEach(this.tests, async t => {
      if ((this.bail && this.testResults.length)) return;
      let testRouteName = t.name.split('.')[0];
      this.test = t;
      await this.createDirectories(testRouteName);
      await asyncForEach(this.dimensions, async d => {
        if ((this.bail && this.testResults.length)) return;
        await this.handleScreenshot(d.type, testRouteName);
        if (!this.isGolden) {
          this.output.prependDebugMessageToSpinner(`Comparing Screenshots - ${testRouteName} (${d.type})`, false, this.testResults);
          let resp = await this.compareScreenshot(d);
          await this.testResults.push.apply(this.testResults, resp);
          if (resp.length) this.output.prependDebugMessageToSpinner('Screenshot was not a match!', false, this.testResults);
        }
        this.output.incrementTestCount();
      });
      const bailTriggered = this.bail && Boolean(this.testResults.length);
      this.output.updateSpinnerDisplay(bailTriggered, this.testResults);
    });
    const bailTriggered = this.bail && Boolean(this.testResults.length);
    this.output.displayTestCompletion(bailTriggered, this.testResults);
    return {tests: this.tests.map(t => t.name), failures: this.testResults, bailTriggered};
  }

  async createDirectories(testRouteName) {
    if (!this.isGolden && !fs.existsSync(`${this.diffDirectory}/`)) createDirectory(`${this.diffDirectory}`);
    this.dirToUse = this.isGolden ? this.goldenDirectory : this.testDirectory;
    await asyncForEach(this.dimensions, d => {
      if (!this.isGolden && !fs.existsSync(`${this.goldenDirectory}/${d.type}/${testRouteName}`)) this.output.displayFailure('Missing Golden Images');
      createDirectory(`${this.dirToUse}/${d.type}/${testRouteName}`);
      global.response = 0;
    });
    return global.response;
  }

  async handleScreenshot(screenType, testRouteName) {
    this.output.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${screenType})`, false, this.testResults);
    let dimensions = this.handleScreenDimensions(screenType);
    let options = {debug: this.debug, dimensions, defaultTime: this.defaultTime};
    this.browser = new Browser();
    await this.browser.launch(options);
    await this.takeScreenshot(screenType, testRouteName, dimensions);
    this.browser.close();
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
    this.output.prependDebugMessageToSpinner(` - url: ${url}`, false, this.testResults);
    try {
      await this.browser.goto(url);
    } catch (err) {
      this.output.displayFailure('  baseUrl supplied cannot be reached.');
    }
    const options = {
      path: `${this.dirToUse}/${fileName}/screen.${this.fileType}`,
      type: this.fileType
    };
    if (this.fileType === 'jpeg') options.quality = this.quality;
    if (this.test.delay) await this.waitForRender(this.test.delay);
    await this.browser.screenshot(options);
    await this._optimizeImages(`${this.dirToUse}/${fileName}/screen.${this.fileType}`, dimensions);
    await deleteFile(`${this.dirToUse}/${fileName}/screen.${this.fileType}`);
    if (this.test.actions) {
      await asyncForEach(this.test.actions, async (b, i) => {await this.handleAction(`${fileName}`, b, dimensions, testRouteName, screenType, i);});
    }
  }

  async handleAction(f, b, dimensions, testRouteName, screenType, actionIndex) {
    if (b.excludeDimensions && b.excludeDimensions.includes(screenType)) return;
    if (!b.target) {
      global.response = 1;
      this.output.displayFailure('Targets are required for actions.');
    }
    let targetName = this.cleanTargetName(b.target);
    try {
      await this.browser.performAction(b, this.test);
    } catch (err) {
      global.response = 1;
      this.output.displayFailure(`  Issue performing action: ${b.type} for test: ${this.test.name}`);
    }
    if (!b.skipScreen) {
      let options = {
        path: `${this.dirToUse}/${f}/${actionIndex}-${b.type}-${targetName}-screen.${this.fileType}`,
        type: this.fileType
      };
      if (this.fileType === 'jpeg') options.quality = this.quality;
      this.output.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${screenType}-${b.type}-${targetName})`, false, this.testResults);
      await this.browser.screenshot(options);
      await this._optimizeImages(`${this.dirToUse}/${f}/${actionIndex}-${b.type}-${targetName}-screen.${this.fileType}`, dimensions);
      await deleteFile(`${this.dirToUse}/${f}/${actionIndex}-${b.type}-${targetName}-screen.${this.fileType}`);
      this.output.incrementTestCount();
    }
  }

  waitForRender(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async _optimizeImages(path, dimensions) {
    const width = dimensions.scale ? Math.floor(dimensions.width * dimensions.scale) : dimensions.width;
    const height = dimensions.scale ? Math.floor(dimensions.height * dimensions.scale) : dimensions.height;
    await optimizeImage(path, {width, height}, this.fileType);
  }
};
