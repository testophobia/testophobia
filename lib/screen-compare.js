/* global global, require, exports */
const fs = require("fs");
const {PNG} = require("pngjs");
const jpeg = require("jpeg-js");
const pixelmatch = require("pixelmatch");
const {getDate} = require("./utils/get-date");
const chalk = require("chalk");
const mkdirp = require("mkdirp");
const {ScreenBase} = require("./screen-base");

exports.ScreenCompare = class ScreenCompare extends ScreenBase {
  constructor(testRoutes) {
    super(testRoutes);
    this.totalFail = 0;
    this.totalPass = 0;
    this.failures = [];
  }

  async run() {
    let {verbose = false} = global.conf;
    if (verbose) this.printOpeningSCMessage();
    await this.asyncForEach(this.routes, async f => {
      this.routeName = f.name.split(".")[0];
      await this.asyncForEach(this.dimensions, async d => {
        this.testDimensions = d;
        if (f.behaviors) {
          f.behaviors.map(async b => {
            await this.prepareImages(d.type, b, verbose);
          });
        }
        await this.prepareImages(d.type);
      });
    });
    this.printClosingSCMessage();
    return Boolean(this.totalFail > 0);
  }

  printOpeningSCMessage() {
    console.log(chalk.dim(`\nconfig -----------------------------------\n`));
    console.log(chalk.dim(`Threshold used: ${this.threshold}\n`));
    console.log(chalk.dim(`------------------------------------------\n`));
  }

  printClosingSCMessage() {
    console.log(chalk.cyan("💪 Testophobia screenshot compare complete!\n"));
    console.log(
      `Testophobia Results: [ ${
      this.totalFail
        ? `${chalk.green(`${this.totalPass} Pass`)} | ${chalk.red(
          `${this.totalFail} Fail`
        )}`
        : `${chalk.green(`${this.totalPass}/${this.totalPass} Pass`)}`
      } ]\n`
    );
    if (this.resultFile) this.closeResultFile();
  }

  closeResultFile() {
    this.results.totalTests = this.totalFail + this.totalPass;
    this.results.totalFailures = this.totalFail;
    this.results.failures = this.failures;
    this.appendToResultFile();
  }

  appendToResultFile() {
    fs.appendFileSync(this.resultFile, JSON.stringify(this.results), err => {
      if (err) console.log("There was an error adding info to the JSON file");
    });
  }

  prepareImages(screenType, behavior = false, verbose) {
    this.screenType = screenType;
    this.filePath = `${this.screenType}/${this.routeName}/${
      behavior ? `${behavior.type}-${this.cleanTargetName(behavior.target)}-` : ""
      }screen-scaled.${this.fileType}`;
    let img1, img2;
    if (verbose)
      console.log(
        chalk.dim(
          `Comparing screens for ${this.routeName} - ${screenType} view ...\n`
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
      {threshold: global.conf.threshold}
    );

    if (numDiffPixels) {
      this.handleScreenshotsDifferent(diff, numDiffPixels);
      return;
    }
    ++this.totalPass;
  }

  handleScreenshotsDifferent(diff, dp) {
    if (this.routeName.includes("/"))
      mkdirp.sync(`${this.diffDirectory}/${this.routeName}`);
    if (!this.resultFile) this.createResultFile();
    diff
      .pack()
      .pipe(
        fs.createWriteStream(
          `${this.diffDirectory}/${this.routeName}-${
          this.screenType
          }-${getDate()}-diff.png`
        )
      );
    this.displayErrorDetails(dp);
    this.appendDetailsToFailures(dp);
    global.response = 1;
    ++this.totalFail;
  }

  createResultFile() {
    this.resultFile = `${this.diffDirectory}/results.json`;
    fs.createWriteStream(this.resultFile);
    this.results = {
      routes: this.routes.map(r => r.name),
      date: Date.now(),
      quality: this.quality,
      threshold: this.threshold,
      baseUrl: this.baseUrl,
      screenTypes: this.dimensions
    };
  }

  displayErrorDetails(dp) {
    console.log(
      chalk.red(
        `${this.routeName} ${this.screenType} Pixel Difference: ${dp}\n`
      )
    );
    console.log(
      ` - Diff file location: ` +
      chalk.underline(
        `${this.diffDirectory}/${this.routeName}-${
        this.screenType
        }-${getDate()}-diff.png\n`
      )
    );
  }

  appendDetailsToFailures(dp) {
    this.failures.push({
      route: this.routeName,
      screenType: this.screenType,
      pixelDifference: dp,
      dimensions: this.testDimensions,
      testFileLocation: `${this.testDirectory}/${this.filePath}`,
      goldenFileLocation: `${this.goldenDirectory}/${this.filePath}`,
      diffFileLocation: `${this.diffDirectory}/${this.routeName}-${
        this.screenType
        }-${getDate()}-diff.png`
    });
  }
};
