/* global exports, process, require */
const path = require('path');

exports.tempPath = path.join(process.cwd(), 'tests/temp');

exports.testPath = "examples/basic/tests/about/about-test.js";

exports.config = {
  golden: true,
  fileType: 'png',
  threshold: 0.2,
  baseUrl: 'https://google.com',
  dimensions: [
    {
      type: "desktop",
      width: 1450,
      height: 1088,
      scale: 0.42
    },
    {
      type: "tablet",
      width: 900,
      height: 1200,
      scale: 0.42
    }
  ],
  tests: exports.testPath
};

exports.exampleTest = [{
  name: "home",
  path: "home/index.html",
  actions: [
    {
      excludeDimensions: ['tablet'],
      type: "click",
      target: "#btn"
    }
  ]
}];

exports.exampleAction = {
  type: "click",
  target: "body",
  delay: 100
};

exports.browserConfig = {
  baseUrl: 'http://google.com',
  dimensions: {
    height: 300,
    width: 200
  },
  debug: false,
  defaultTime: false
};