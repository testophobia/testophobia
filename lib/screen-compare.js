/* global global, require, exports */
const fs = require('fs');
const {PNG} = require('pngjs');
const pixelmatch = require('pixelmatch');
const {getDate, Logger, asyncForEach} = require('./utils');
const mkdirp = require('mkdirp');
const {ScreenBase} = require('./screen-base');
const {retrieveImageData} = require('./retrieve-image-data');

const log = new Logger(Logger.INFO_LEVEL);

exports.ScreenCompare = class ScreenCompare extends ScreenBase {
  constructor(config, test, testDimension) {
    super(config);
    this.test = test;
    this.testDimension = testDimension;
    this.failures = [];
    if (config.verbose) log.setLevel(Logger.DEBUG_LEVEL);
  }

  async run() {
    let pixDiff;
    this.testRouteName = this.test.name.split(".")[0];
    let screenType = this.testDimension.type;
    let filePath = `${screenType}/${this.testRouteName}/screen-scaled.${this.fileType}`;
    if (this.test.actions) {
      await asyncForEach(this.test.actions, async (b, i) => {
        if ((this.bail && this.failures.length) || b.skipScreen || (b.excludeDimensions && b.excludeDimensions.includes(this.testDimension.type))) return;
        filePath = `${this.testDimension.type}/${this.testRouteName}/${i}-${b.type}-${this.cleanTargetName(b.target)}-screen-scaled.${this.fileType}`;
        let img1 = retrieveImageData(`${this.testDirectory}/${filePath}`, this.fileType);
        let img2 = retrieveImageData(`${this.goldenDirectory}/${filePath}`, this.fileType);
        if (!img1 || !img2) return;
        pixDiff = await this._compareScreenshots(img1, img2);
        if (pixDiff) await this._handleScreenshotsDifferent(screenType, filePath, pixDiff.diff, pixDiff.numDiffPixels, b, i);
      });
    }
    if (this.bail && this.failures.length) return this.failures;
    let img1 = retrieveImageData(`${this.testDirectory}/${filePath}`, this.fileType);
    let img2 = retrieveImageData(`${this.goldenDirectory}/${filePath}`, this.fileType);
    if (!img1 || !img2) return;
    pixDiff = await this._compareScreenshots(img1, img2);
    if (pixDiff) this._handleScreenshotsDifferent(screenType, filePath, pixDiff.diff, pixDiff.numDiffPixels);
    return this.failures;
  }

  _compareScreenshots(img1, img2) {
    if (img1.width !== img2.width) {
      global.response = 1;
      log.fatal('screens are not the same size!');
    }

    const diff = new PNG({width: img1.width, height: img1.height});

    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      img1.width,
      img1.height,
      {threshold: this.test.threshold || this.threshold}
    );

    return numDiffPixels ? {numDiffPixels, diff} : 0;
  }

  _handleScreenshotsDifferent(screenType, filePath, diff, dp, action = false, actionIndex = false) {
    let actionStr = (action) ? `${actionIndex}-${action.type}-${this.cleanTargetName(action.target)}` : '';
    let diffFilePath = `${this.diffDirectory}/${this.testRouteName}-${screenType}-${getDate()}-${actionStr}-diff.png`;
    if (this.testRouteName.includes("/")) mkdirp.sync(`${this.diffDirectory}/${this.testRouteName}`);
    diff.pack().pipe(fs.createWriteStream(diffFilePath));
    this.failures.push({
      test: this.testRouteName,
      screenType,
      action: actionStr,
      pixelDifference: dp,
      dimensions: this.testDimension,
      testFileLocation: `${this.testDirectory}/${filePath}`,
      goldenFileLocation: `${this.goldenDirectory}/${filePath}`,
      diffFileLocation: diffFilePath
    });
    global.response = 1;
  }
};
