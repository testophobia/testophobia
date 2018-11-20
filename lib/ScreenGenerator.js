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
    await this._handleScreenshot(this.testDimension, testRouteName);
  }

  async _handleScreenshot(screenType, testRouteName) {
    this.output.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${screenType})`, false, this.testResults);
    let dimensions = this._handleScreenDimensions(screenType);
    let options = {debug: this.debug, dimensions, defaultTime: this.defaultTime};
    this.browser = new Browser();
    await this.browser.launch(options);
    await this._takeScreenshot(screenType, testRouteName, dimensions);
    this.browser.close();
  }

  _handleScreenDimensions(screenType) {
    return this.dimensions.find(d => d.type === screenType);
  }

  async _takeScreenshot(screenType, testRouteName, dimensions) {
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
      await asyncForEach(this.test.actions, async (b, i) => {await this._handleAction(`${fileName}`, b, dimensions, testRouteName, screenType, i);});
    }
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
