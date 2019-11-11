/* global require, exports */
const fs = require('fs-extra');
const {getDate} = require('./utils/date/date');
const {getActionFileName, cleanFileName} = require('./utils/file/file-name');
const {retrieveImageData} = require('./utils/image/retrieve-image-data');
const {compareScreenshots} = require('./utils/image/compare-images');

/**
 * @class Compares two screenshots for differences
 */
exports.ScreenCompare = class ScreenCompare {
  constructor(config, test, testDefinitionPath, dimensions, output) {
    this.config = config;
    this.test = test;
    this.testDefinitionPath = testDefinitionPath;
    this.dimensions = dimensions;
    this.output = output;
    this.failure = {};
  }

  /**
   * Perform the screen comparison
   *
   * @param {string} testRouteName Test route
   * @param {string} filePath Relative path the test/golden files
   * @param {object} action The Testophobia action related to the screenshot
   * @param {number} index The index of the test action within the encompassing test
   * @return {object} The failure object (empty if no failure)
   */
  run(testRouteName, filePath, action, index) {
    this.testRouteName = testRouteName;
    this.filePath = filePath;
    this._performComparison(action, index);
    return this.failure;
  }

  _performComparison(action, index) {
    const actionThreshold = action ? action.threshold || false : false;
    const threshold = actionThreshold || this.test.threshold || this.config.threshold;
    const img1 = retrieveImageData(`${this.config.testDirectory}/${this.filePath}`, this.config.fileType);
    const img2 = retrieveImageData(`${this.config.goldenDirectory}/${this.filePath}`, this.config.fileType);
    if (!img1 || !img2) {
      this._setFailure(this.dimensions.type, action, index, null, null);
      return;
    }
    const pixDiff = compareScreenshots(img1, img2, threshold);
    if (pixDiff === -1) this.output.displayFailure(`Screen sizes for ${this.test.name} - ${this.dimensions.type} do not match!`);
    return pixDiff ? this._handleScreenshotsDifferent(this.dimensions.type, pixDiff.diff, pixDiff.numDiffPixels, action, index) : 0;
  }

  _handleScreenshotsDifferent(screenType, diff, dp, action, index) {
    let actionPath = action ? `${index}-${action.type}-${cleanFileName(action.target)}` : '';
    let diffFilePath = `${this.config.diffDirectory}/${this.testRouteName}-${screenType}-${actionPath}-${getDate()}-diff.png`;
    if (this.testRouteName.includes('/')) fs.ensureDirSync(`${this.config.diffDirectory}/${this.testRouteName}`);
    diff.pack().pipe(fs.createWriteStream(diffFilePath));
    this._setFailure(screenType, action, index, dp, diffFilePath);
  }

  _setFailure(screenType, actionObj, actionIdx, pixelDifference, diffFileLocation) {
    const action = actionObj ? getActionFileName(actionIdx, actionObj, true) : 'none';
    this.failure = {
      test: this.testRouteName,
      testDefinitionPath: this.testDefinitionPath,
      screenType,
      action,
      pixelDifference,
      dimensions: this.dimensions,
      testFileLocation: `${this.config.testDirectory}/${this.filePath}`,
      goldenFileLocation: `${this.config.goldenDirectory}/${this.filePath}`,
      diffFileLocation
    };
  }
};
