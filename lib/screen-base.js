/* global global, exports */

exports.ScreenBase = class ScreenBase {
  constructor(testRoutes) {
    this.routes = testRoutes;
    this.threshold = global.conf.threshold || 0.2;
    this.diffDirectory = global.conf.diffDirectory || "./testophobia/diffs";
    this.goldenDirectory =
      global.conf.goldenDirectory || "./testophobia/golden-screens";
    this.testDirectory =
      global.conf.testDirectory || "./testophobia/test-screens";
    this.baseUrl = global.conf.baseUrl || "http://localhost:6789";
    this.fileType = global.conf.fileType || "png";
    this.quality = global.conf.quality || 80;
    this.dimensions = global.conf.dimensions || [
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
    return s.replace('#', '').replace('.', '').replace(' ', '-');
  }

  /*abstract*/ async run() {}
};
