/* global require, exports */
const {Browser} = require('./Browser');
const {ScreenBase} = require('./ScreenBase');
const {asyncForEach, deleteFile} = require('./utils');
const {optimizeImage} = require('./utils/optimize-image');

exports.ScreenGenerator = class ScreenGenerator extends ScreenBase {
  constructor(config, test, testDimension, dirToUse, output, testResults) {
    super(config);
    this.test = test;
    this.testDimension = testDimension;
    this.dirToUse = dirToUse;
    this.testResults = testResults;
    this.output = output;
  }

  async run(testRouteName) {
    await this._prepareForScreenshots(this.testDimension, testRouteName);
  }

  async _prepareForScreenshots(screenType, testRouteName) {
    this.output.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${screenType})`, false, this.testResults);
    let dimensions = this.dimensions.find(d => d.type === screenType);
    await this._initBrowser(dimensions);
    await this._navigateToPage();
    await this._handleScreenshots(screenType, testRouteName, dimensions);
    this.browser.close();
  }

  async _initBrowser(dimensions) {
    let options = {debug: this.debug, dimensions, defaultTime: this.defaultTime};
    this.browser = new Browser();
    await this.browser.launch(options);
  }

  async _navigateToPage() {
    const url = `${this.baseUrl}${this.test.path ? '/' + this.test.path.replace(/^\/+/g, '') : ''}`;
    this.output.prependDebugMessageToSpinner(` - url: ${url}`, false, this.testResults);
    try {
      await this.browser.goto(url);
    } catch (err) {
      this.output.displayFailure('  baseUrl supplied cannot be reached.');
    }
  }

  async _handleScreenshots(screenType, testRouteName, dimensions) {
    const fileName = screenType + '/' + (testRouteName ? testRouteName : 'home');
    const path = `${this.dirToUse}/${fileName}/screen.${this.fileType}`;
    if (this.test.delay) await this.waitForRender(this.test.delay);
    await this._takeScreenshot(path, dimensions);
    if (this.test.actions) {
      await asyncForEach(this.test.actions, async (b, i) => {await this._handleAction(`${fileName}`, b, dimensions, testRouteName, screenType, i);});
    }
  }

  async _takeScreenshot(path, dimensions) {
    let options = this._getScreenshotOptions(path);
    await this.browser.screenshot(options);
    await this._optimizeImages(path, dimensions);
    return deleteFile(path);
  }

  _getScreenshotOptions(path) {
    const options = {
      path,
      type: this.fileType
    };
    if (this.fileType === 'jpeg') options.quality = this.quality;
    return options;
  }

  async _handleAction(f, b, dimensions, testRouteName, screenType, actionIndex) {
    if (b.excludeDimensions && b.excludeDimensions.includes(screenType)) return;
    if (!b.target) {
      this.output.displayFailure('Targets are required for actions.');
    }
    let targetName = this.cleanTargetName(b.target);
    try {
      await this.browser.performAction(b, this.test);
    } catch (err) {
      this.output.displayFailure(`  Issue performing action: ${b.type} for test: ${this.test.name}`);
    }
    if (!b.skipScreen) {
      this.output.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${screenType}-${b.type}-${targetName})`, false, this.testResults);
      let path = `${this.dirToUse}/${f}/${actionIndex}-${b.type}-${targetName}-screen.${this.fileType}`;
      await this._takeScreenshot(path, dimensions);
      this.output.incrementTestCount();
    }
  }

  waitForRender(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  _optimizeImages(path, dimensions) {
    const width = dimensions.scale ? Math.floor(dimensions.width * dimensions.scale) : dimensions.width;
    const height = dimensions.scale ? Math.floor(dimensions.height * dimensions.scale) : dimensions.height;
    return optimizeImage(path, {width, height}, this.fileType);
  }

};
