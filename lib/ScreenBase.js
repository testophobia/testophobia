/* global exports */

exports.ScreenBase = class ScreenBase {
  constructor(config, tests) {
    this.isGolden = config.golden || false;
    this.tests = tests;
    this.bail = config.bail;
    this.verbose = config.verbose;
    this.threshold = config.threshold;
    this.debug = config.debug;
    this.diffDirectory = config.diffDirectory;
    this.goldenDirectory = config.goldenDirectory;
    this.testDirectory = config.testDirectory;
    this.baseUrl = config.baseUrl;
    this.fileType = config.fileType;
    this.defaultTime = config.defaultTime;
    this.quality = config.quality;
    this.dimensions = config.dimensions;
  }

  cleanTargetName(s) {
    return s
      .replace(/ /g, '-')
      .replace(/[`~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/g, '-'); //eslint-disable-line no-useless-escape
  }

  /*abstract*/ async run() {}

};
