/* global require, exports */
const fs = require('fs');
const {PNG} = require('pngjs');
const pixelmatch = require('pixelmatch');
const {getDate, asyncForEach} = require('./utils');
const mkdirp = require('mkdirp');
const {ScreenBase} = require('./ScreenBase');
const {retrieveImageData} = require('./utils/retrieve-image-data');

exports.ScreenCompare = class ScreenCompare extends ScreenBase {
  constructor(config, test, testDimension) {
    super(config);
    this.test = test;
    this.testDimension = testDimension;
    this.failures = [];
  }

  async run(testRouteName) {
    this.testRouteName = testRouteName;
    let filePath = `${this.testDimension.type}/${this.testRouteName}/screen-scaled.${this.fileType}`;

    if (this.test.actions) {
      await asyncForEach(this.test.actions, async (b, i) => {
        if ((this.bail && this.failures.length) || b.skipScreen || (b.excludeDimensions && b.excludeDimensions.includes(this.testDimension.type))) return;
        filePath = `${this.testDimension.type}/${this.testRouteName}/${i}-${b.type}-${this.cleanTargetName(b.target)}-screen-scaled.${this.fileType}`;
        await this._performComparison(filePath, b, i);
      });
    }

    if (this.bail && this.failures.length) return this.failures;

    await this._performComparison(filePath);
    return this.failures;
  }

  async _performComparison(filePath, action = false, actionIndex = false) {
    let pixDiff;
    let img1 = retrieveImageData(`${this.testDirectory}/${filePath}`, this.fileType);
    let img2 = retrieveImageData(`${this.goldenDirectory}/${filePath}`, this.fileType);

    if (!img1 || !img2) return;

    pixDiff = await this._compareScreenshots(img1, img2);

    if (pixDiff) await this._handleScreenshotsDifferent(this.testDimension.type, filePath, pixDiff.diff, pixDiff.numDiffPixels, action, actionIndex);
  }

  _compareScreenshots(img1, img2) {
    if (img1.width !== img2.width) return 0;

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

    //eventually return failure, push in test runner 
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
  }
};
