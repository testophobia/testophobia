/* global exports */

exports.ScreenBase = class ScreenBase {
  constructor(config, tests) {
    this.tests = tests;
    this.bail = config.bail;
    this.verbose = config.verbose;
    this.threshold = config.threshold;
    this.diffDirectory = config.diffDirectory;
    this.goldenDirectory = config.goldenDirectory;
    this.testDirectory = config.testDirectory;
    this.baseUrl = config.baseUrl;
    this.fileType = config.fileType;
    this.quality = config.quality;
    this.dimensions = config.dimensions;
  }

  async asyncForEach(arr, cb) {
    for (let i = 0; i < arr.length; i++) {
      await cb(arr[i], i, arr);
    }
  }

  cleanTargetName(s) {
    return s
      .replace(/ /g, '-')
      .replace(/[`~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/g, '-'); //eslint-disable-line no-useless-escape
  }

  /*abstract*/ async run() {}
};
