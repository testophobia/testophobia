/* global require, exports */
const fs = require('fs');
const {PNG} = require('pngjs');
const pixelmatch = require('pixelmatch');
const {getDate, asyncForEach, cleanTargetName} = require('./utils');
const mkdirp = require('mkdirp');
const {retrieveImageData} = require('./utils/retrieve-image-data');

exports.ScreenCompare = class ScreenCompare {
  constructor(config, test, testDimension, output) {
    this.config = config;
    this.test = test;
    this.testDimension = testDimension;
    this.failures = [];
    this.output = output;
  }

  async run(testRouteName) {
    this.testRouteName = testRouteName;
    let filePath = `${this.testDimension.type}/${this.testRouteName}/screen-scaled.${this.config.fileType}`;

    if (this.test.actions) {
      await asyncForEach(this.test.actions, async (b, i) => {
        if ((this.config.bail && this.failures.length) || b.skipScreen || (b.excludeDimensions && b.excludeDimensions.includes(this.testDimension.type))) return;
        filePath = `${this.testDimension.type}/${this.testRouteName}/${i}-${b.type}-${cleanTargetName(b.target)}-screen-scaled.${this.config.fileType}`;
        await this._performComparison(filePath, b, i);
      });
    }

    if (this.config.bail && this.failures.length) return this.failures;

    await this._performComparison(filePath);
    return this.failures;
  }

  async _performComparison(filePath, action = false, actionIndex = false) {
    let pixDiff;
    let img1 = retrieveImageData(`${this.config.testDirectory}/${filePath}`, this.config.fileType);
    let img2 = retrieveImageData(`${this.config.goldenDirectory}/${filePath}`, this.config.fileType);

    if (!img1 || !img2) return;

    pixDiff = await this._compareScreenshots(img1, img2);

    return pixDiff ? this._handleScreenshotsDifferent(this.testDimension.type, filePath, pixDiff.diff, pixDiff.numDiffPixels, action, actionIndex) : 0;
  }

  _compareScreenshots(img1, img2) {
    if (img1.width !== img2.width || img1.height !== img2.height) return this.output.displayFailure(`  Screen sizes for ${this.test.name} - ${this.testDimension.type} do not match!`);

    const diff = new PNG({width: img1.width, height: img1.height});

    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      img1.width,
      img1.height,
      {threshold: this.test.threshold || this.config.threshold}
    );

    return numDiffPixels ? {numDiffPixels, diff} : 0;
  }

  _handleScreenshotsDifferent(screenType, filePath, diff, dp, action = false, actionIndex = false) {
    let actionStr = (action) ? `${actionIndex}-${action.type}-${cleanTargetName(action.target)}` : '';
    let diffFilePath = `${this.config.diffDirectory}/${this.testRouteName}-${screenType}-${getDate()}-${actionStr}-diff.png`;

    if (this.testRouteName.includes("/")) mkdirp.sync(`${this.config.diffDirectory}/${this.testRouteName}`);

    diff.pack().pipe(fs.createWriteStream(diffFilePath));

    this.failures.push({
      test: this.testRouteName,
      screenType,
      action: actionStr,
      pixelDifference: dp,
      dimensions: this.testDimension,
      testFileLocation: `${this.config.testDirectory}/${filePath}`,
      goldenFileLocation: `${this.config.goldenDirectory}/${filePath}`,
      diffFileLocation: diffFilePath
    });
  }

};
