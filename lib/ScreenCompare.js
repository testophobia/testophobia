/* global require, exports */
const fs = require('fs');
const {PNG} = require('pngjs');
const pixelmatch = require('pixelmatch');
const {getDate} = require('./utils');
const mkdirp = require('mkdirp');
const {retrieveImageData} = require('./utils/retrieve-image-data');

exports.ScreenCompare = class ScreenCompare {
  constructor(config, test, dimensions) {
    this.config = config;
    this.test = test;
    this.dimensions = dimensions;
    this.failure = {};
  }

  async run(testRouteName, filePath, action = false) {
    this.testRouteName = testRouteName;
    await this._performComparison(filePath, action);
    return this.failure;
  }

  async _performComparison(filePath, action) {
    let pixDiff;
    let img1 = retrieveImageData(`${this.config.testDirectory}/${filePath}`, this.config.fileType);
    let img2 = retrieveImageData(`${this.config.goldenDirectory}/${filePath}`, this.config.fileType);

    if (!img1 || !img2) {
      this.failure = {err: 'no image'};
      return;
    }

    pixDiff = await this._compareScreenshots(img1, img2);

    return pixDiff ? this._handleScreenshotsDifferent(this.dimensions.type, filePath, pixDiff.diff, pixDiff.numDiffPixels, action) : 0;
  }

  _compareScreenshots(img1, img2) {
    if (img1.width !== img2.width || img1.height !== img2.height) return this.output.displayFailure(`  Screen sizes for ${this.test.name} - ${this.dimensions.type} do not match!`);

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

  _handleScreenshotsDifferent(screenType, filePath, diff, dp, action) {
    let diffFilePath = `${this.config.diffDirectory}/${this.testRouteName}-${screenType}-${getDate()}-diff.png`;

    if (this.testRouteName.includes("/")) mkdirp.sync(`${this.config.diffDirectory}/${this.testRouteName}`);

    diff.pack().pipe(fs.createWriteStream(diffFilePath));

    this.failure = {
      test: this.testRouteName,
      screenType,
      action: action ? `${action.type} - ${action.target}` : 'none',
      pixelDifference: dp,
      dimensions: this.dimensions,
      testFileLocation: `${this.config.testDirectory}/${filePath}`,
      goldenFileLocation: `${this.config.goldenDirectory}/${filePath}`,
      diffFileLocation: diffFilePath
    };
  }

};
