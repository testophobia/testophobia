/* global global, require, exports */
const fs = require("fs");
const {PNG} = require("pngjs");
const jpeg = require("jpeg-js");
const pixelmatch = require("pixelmatch");
const {getDate} = require("./utils");
const chalk = require("chalk");
const mkdirp = require("mkdirp");
const {ScreenBase} = require("./screen-base");

exports.ScreenCompare = class ScreenCompare extends ScreenBase {
  constructor(config, testRoutes, test) {
    super(config, testRoutes);
    this.test = test;
    this.totalFail = 0;
    this.totalPass = 0;
    this.failures = [];
  }

  async run() {
    this.testRouteName = this.test.name.split(".")[0];
    await this.asyncForEach(this.dimensions, async d => {
      if (this.bail && this.totalFail > 0) return;
      this.testDimensions = d;
      if (this.test.actions) {
        this.test.actions.map(async b => {
          if ((this.bail && this.totalFail > 0) || b.skipScreen) return;
          await this.prepareImages(d.type, b);
        });
      }
      if (this.bail && this.totalFail > 0) return;
      await this.prepareImages(d.type);
    });
    // insert logic to send object with data for each failure, totals in generator 
    return {response: global.response, failures: this.failures || 0};
  }

  // closeResultFile() {
  //   this.results.totalTests = this.totalFail + this.totalPass;
  //   this.results.totalFailures = this.totalFail;
  //   this.results.failures = this.failures;
  //   this.appendToResultFile();
  // }

  // appendToResultFile() {
  //   fs.appendFileSync(this.resultFile, JSON.stringify(this.results), err => {
  //     if (err) console.log("There was an error adding info to the JSON file");
  //   });
  // }

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
    this.compareScreenshots(img1, img2);
  }

  compareScreenshots(img1, img2) {
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
      this.handleScreenshotsDifferent(diff, numDiffPixels);
      return;
    }
    ++this.totalPass;
  }

  handleScreenshotsDifferent(diff, dp) {
    if (this.testRouteName.includes("/"))
      mkdirp.sync(`${this.diffDirectory}/${this.testRouteName}`);

    diff
      .pack()
      .pipe(
        fs.createWriteStream(
          `${this.diffDirectory}/${this.testRouteName}-${
          this.screenType
          }-${getDate()}-diff.png`
        )
      );
    // this.displayErrorDetails(dp);
    this.failures = {
      test: this.testRouteName,
      screenType: this.screenType,
      pixelDifference: dp,
      dimensions: this.testDimensions,
      testFileLocation: `${this.testDirectory}/${this.filePath}`,
      goldenFileLocation: `${this.goldenDirectory}/${this.filePath}`,
      diffFileLocation: `${this.diffDirectory}/${this.testRouteName}-${
        this.screenType
        }-${getDate()}-diff.png`
    };
    global.response = 1;
    ++this.totalFail;
    if (this.bail)
      console.log(chalk.red(`🚨  Oh no! Test No. ${this.totalPass + 1} Failed!\n`));
  }

  // displayErrorDetails(dp) {
  //   console.log(
  //     chalk.red(
  //       `${this.testRouteName} ${this.screenType} Pixel Difference: ${dp}\n`
  //     )
  //   );
  //   console.log(
  //     ` - Diff file location: ` +
  //     chalk.underline(
  //       `${this.diffDirectory}/${this.testRouteName}-${
  //       this.screenType
  //       }-${getDate()}-diff.png\n`
  //     )
  //   );
  // }

};
