/* global exports */

exports.ScreenBase = class ScreenBase {
  constructor(config, tests) {
    this.tests = tests;
    this.bail = config.bail || false;
    this.verbose = config.verbose || false;
    this.threshold = config.threshold || 0.2;
    this.diffDirectory = config.diffDirectory || "./testophobia/diffs";
    this.goldenDirectory =
      config.goldenDirectory || "./testophobia/golden-screens";
    this.testDirectory =
      config.testDirectory || "./testophobia/test-screens";
    this.baseUrl = config.baseUrl || "http://localhost:6789";
    this.fileType = config.fileType || "png";
    this.quality = config.quality || 80;
    this.dimensions = config.dimensions || [
      {type: "desktop", width: 1024, height: 768},
      {type: "mobile", width: 375, height: 812}
    ];
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
