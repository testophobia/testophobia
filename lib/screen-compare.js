/* global global, require, exports */
const fs = require("fs");
const {PNG} = require("pngjs");
const jpeg = require("jpeg-js");
const pixelmatch = require("pixelmatch");
const {getDate, asyncForEach} = require("./utils");
const chalk = require("chalk");
const mkdirp = require("mkdirp");
const {ScreenBase} = require("./screen-base");

exports.ScreenCompare = class ScreenCompare extends ScreenBase {
  constructor(config, testRoutes, test) {
    super(config, testRoutes);
    this.test = test;
    this.failures = [];
  }

  async run() {
    this.testRouteName = this.test.name.split(".")[0];
    await asyncForEach(this.dimensions, async d => {
      if (this.bail && this.failures.length) return;
      this.testDimensions = d;
      if (this.test.actions) {
        this.test.actions.map(async b => {
          if ((this.bail && this.failures.length) || b.skipScreen) return;
          await this.prepareImages(d.type, b);
        });
      }
      if (this.bail && this.failures.length) return;
      await this.prepareImages(d.type);
    });
    return this.failures;
  }

  prepareImages(screenType, action = false) {
    this.screenType = screenType;
    this.filePath = `${this.screenType}/${this.testRouteName}/${
      action ? `${action.type}-${this.cleanTargetName(action.target)}-` : ""
      }screen-scaled.${this.fileType}`;
    let img1, img2;
    if (this.verbose)
      console.log(
        chalk.dim(
          `Comparing screens for ${this.testRouteName} - ${screenType} view ...\n`
        )
      );
    img1 = fs.readFileSync(`${this.testDirectory}/${this.filePath}`);
    img1 =
      this.fileType === "jpeg" ? jpeg.decode(img1, true) : PNG.sync.read(img1);
    try {
      img2 = fs.readFileSync(`${this.goldenDirectory}/${this.filePath}`);
    } catch (error) {
      global.response = 1;
      throw new Error(chalk.red("No golden images to compare."));
    }
    img2 =
      this.fileType === "jpeg" ? jpeg.decode(img2, true) : PNG.sync.read(img2);
    this.compareScreenshots(img1, img2, action);
  }

  compareScreenshots(img1, img2, action) {
    if (img1.width !== img2.width) {
      global.response = 1;
      throw new Error("screens are not the same size!");
    }

    const diff = new PNG({
      width: img1.width,
      height: img1.height
    });
    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      img1.width,
      img1.height,
      {threshold: this.threshold}
    );

    if (numDiffPixels) {
      this.handleScreenshotsDifferent(diff, numDiffPixels, action);
      return;
    }
  }

  handleScreenshotsDifferent(diff, dp, action) {
    let diffFilePath = `${this.diffDirectory}/${this.testRouteName}-${
      this.screenType
      }-${getDate()}-${
      action ? `${action.type}-${this.cleanTargetName(action.target)}-` : ""
      }-diff.png`;
    if (this.testRouteName.includes("/"))
      mkdirp.sync(`${this.diffDirectory}/${this.testRouteName}`);

    diff
      .pack()
      .pipe(
        fs.createWriteStream(
          diffFilePath
        )
      );
    this.failures.push({
      test: this.testRouteName,
      screenType: this.screenType,
      pixelDifference: dp,
      dimensions: this.testDimensions,
      testFileLocation: `${this.testDirectory}/${this.filePath}`,
      goldenFileLocation: `${this.goldenDirectory}/${this.filePath}`,
      diffFileLocation: diffFilePath
    });
    global.response = 1;
  }
};
