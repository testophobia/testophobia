/* global require, exports */
const fs = require('fs-extra');
const {PNG} = require('pngjs');
const pixelmatch = require('pixelmatch');
const {getDate} = require('./utils/date/date');
const {getActionFileName, cleanFileName} = require('./utils/file-name');
const {retrieveImageData} = require('./utils/retrieve-image-data');

exports.ScreenCompare = class ScreenCompare {
  constructor(config, test, testDefinitionPath, dimensions, output) {
    this.config = config;
    this.test = test;
    this.testDefinitionPath = testDefinitionPath;
    this.dimensions = dimensions;
    this.output = output;
    this.failure = {};
  }

  async run(testRouteName, filePath, action, index) {
    this.testRouteName = testRouteName;
    await this._performComparison(filePath, action, index);
    return this.failure;
  }

  async _performComparison(filePath, action, index) {
    let pixDiff;
    let img1 = retrieveImageData(`${this.config.testDirectory}/${filePath}`, this.config.fileType);
    let img2 = retrieveImageData(`${this.config.goldenDirectory}/${filePath}`, this.config.fileType);

    if (!img1 || !img2) {
      this._setFailure(
        this.testRouteName,
        this.testDefinitionPath,
        this.dimensions.type,
        action,
        index,
        null,
        this.dimensions,
        `${this.config.testDirectory}/${filePath}`,
        `${this.config.goldenDirectory}/${filePath}`,
        null
      );
      return;
    }

    const actionThreshold = action ? action.threshold || false : false;
    const threshold = actionThreshold || this.test.threshold || this.config.threshold;

    pixDiff = await this._compareScreenshots(img1, img2, threshold);

    return pixDiff ? this._handleScreenshotsDifferent(this.dimensions.type, filePath, pixDiff.diff, pixDiff.numDiffPixels, action, index) : 0;
  }

  _compareScreenshots(img1, img2, threshold) {
    if (img1.width !== img2.width || img1.height !== img2.height)
      return this.output.displayFailure(`Screen sizes for ${this.test.name} - ${this.dimensions.type} do not match!`);

    const diff = new PNG({width: img1.width, height: img1.height});

    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {threshold: threshold});

    return numDiffPixels ? {numDiffPixels, diff} : 0;
  }

  _handleScreenshotsDifferent(screenType, filePath, diff, dp, action, index) {
    let actionPath = action ? `${index}-${action.type}-${cleanFileName(action.target)}` : '';
    let diffFilePath = `${this.config.diffDirectory}/${this.testRouteName}-${screenType}-${actionPath}-${getDate()}-diff.png`;

    if (this.testRouteName.includes('/')) fs.ensureDirSync(`${this.config.diffDirectory}/${this.testRouteName}`);

    diff.pack().pipe(fs.createWriteStream(diffFilePath));

    this._setFailure(
      this.testRouteName,
      this.testDefinitionPath,
      screenType,
      action,
      index,
      dp,
      this.dimensions,
      `${this.config.testDirectory}/${filePath}`,
      `${this.config.goldenDirectory}/${filePath}`,
      diffFilePath
    );
  }

  _setFailure(test, testDefinitionPath, screenType, actionObj, actionIdx, pixelDifference, dimensions, testFileLocation, goldenFileLocation, diffFileLocation) {
    const action = actionObj ? getActionFileName(actionIdx, actionObj, true) : 'none';
    this.failure = {
      test,
      testDefinitionPath,
      screenType,
      action,
      pixelDifference,
      dimensions,
      testFileLocation,
      goldenFileLocation,
      diffFileLocation
    };
  }
};
