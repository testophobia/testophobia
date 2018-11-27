/* global require, process */
const test = require('ava');
const {ScreenCompare} = require('../lib/ScreenCompare');
const fs = require('fs');
const path = require('path');

const testPath = "examples/basic/tests/about/about-test.js";
const imgPath = path.join(process.cwd(), 'tests/temp');
const fullPath = `${imgPath}/testophobia-recorder.png`;

const exampleTest = {
  name: "about",
  path: "about/about.html"
};

const config = {
  diffDirectory: imgPath,
  goldenDirectory: imgPath,
  testDirectory: imgPath,
  fileType: 'png',
  threshold: 0.2,
  baseUrl: 'http://test.com',
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
  tests: testPath
};

test.before(() => {
  fs.copyFile(path.join(process.cwd(), 'docs/images/testophobia-recorder.png'), fullPath, () => 1);
});

test('ScreenCompare init - no args', t => {
  t.throws(() => new ScreenCompare());
});

test('ScreenCompare init - args', async t => {
  let c = await new ScreenCompare(config, exampleTest, 'desktop');
  t.is(c.isGolden === false, true);
  t.is(c.hasOwnProperty('goldenDirectory'), true);
  t.is(c.hasOwnProperty('diffDirectory'), true);
  t.is(c.hasOwnProperty('testDirectory'), true);
  t.is(c.hasOwnProperty('test') && c.test.name === 'about', true);
});

test('ScreenCompare - perform comparison', async t => {
  let c = await new ScreenCompare(config, exampleTest, config.dimensions[0]);
  let d = await c._performComparison(`testophobia-recorder.png`);
  t.is(d, 0);
});

test.after(() => {
  fs.unlink(fullPath, () => 1);
});