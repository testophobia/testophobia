/* global global, require, exports */
const fs = require('fs');
const {PNG} = require('pngjs');
// const jpeg = require('jpeg-js');
const pixelmatch = require('pixelmatch');
const {getDate, Logger} = require('./utils');
const mkdirp = require('mkdirp');
const {ScreenBase} = require('./screen-base');
const {retrieveImages} = require('./retrieve-images');

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
    this.testRouteName = this.test.name.split(".")[0];
    let filePath = `${this.testDimension.type}/${this.testRouteName}/screen-scaled.${this.fileType}`;
    if (this.test.actions) {
      this.test.actions.map(async (b, i) => {
        if ((this.bail && this.failures.length) || b.skipScreen || (b.excludeDimensions && b.excludeDimensions.includes(this.testDimension.type))) return;
        filePath = `${this.testDimension.type}/${this.testRouteName}/${i}-${b.type}-${this.cleanTargetName(b.target)}-screen-scaled.${this.fileType}`;
        let res = await this.retrieveImages(filePath, this.testDirectory, this.goldenDirectory, this.fileType);
        if (!res.error) await this.compareScreenshots(resp.img1, resp.img2, b, i);
      });
    }
    if (this.bail && this.failures.length) return this.failures;
    let resp = await retrieveImages(filePath, this.testDirectory, this.goldenDirectory, this.fileType);
    if (!resp.error) await this.compareScreenshots(resp.img1, resp.img2);
    return this.failures;
  }

  // prepareImages(screenType, action = false, actionIndex) {
  //   this.screenType = screenType;
  //   this.filePath = `${this.screenType}/${this.testRouteName}/${
  //     action ? `${actionIndex}-${action.type}-${this.cleanTargetName(action.target)}-` : ''
  //     }screen-scaled.${this.fileType}`;
  //   let img1, img2;
  //   img1 = fs.readFileSync(`${this.testDirectory}/${this.filePath}`);
  //   img1 = this.fileType === 'jpeg' ? jpeg.decode(img1, true) : PNG.sync.read(img1);
  //   try {
  //     img2 = fs.readFileSync(`${this.goldenDirectory}/${this.filePath}`);
  //   } catch (error) {
  //     global.response = 1;
  //     log.fatal('No golden images to compare.');
  //   }
  //   img2 = this.fileType === 'jpeg' ? jpeg.decode(img2, true) : PNG.sync.read(img2);
  //   this.compareScreenshots(img1, img2, action, actionIndex);
  // }

  compareScreenshots(img1, img2, action, actionIndex) {
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

    if (numDiffPixels) {
      this.handleScreenshotsDifferent(diff, numDiffPixels, action, actionIndex);
      return;
    }
  }

  handleScreenshotsDifferent(diff, dp, action, actionIndex) {
    let actionStr = (action) ? `${actionIndex}-${action.type}-${this.cleanTargetName(action.target)}` : '';
    let diffFilePath = `${this.diffDirectory}/${this.testRouteName}-${this.screenType}-${getDate()}-${actionStr}-diff.png`;
    if (this.testRouteName.includes("/")) mkdirp.sync(`${this.diffDirectory}/${this.testRouteName}`);
    diff.pack().pipe(fs.createWriteStream(diffFilePath));
    this.failures.push({
      test: this.testRouteName,
      screenType: this.screenType,
      action: actionStr,
      pixelDifference: dp,
      dimensions: this.testDimension,
      testFileLocation: `${this.testDirectory}/${this.filePath}`,
      goldenFileLocation: `${this.goldenDirectory}/${this.filePath}`,
      diffFileLocation: diffFilePath
    });
    global.response = 1;
  }
};
