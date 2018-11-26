/* global require, process */
const test = require('ava');
const {ScreenCompare} = require('../lib/ScreenCompare');

const path = "examples/basic/tests/about/about-test.js";

const exampleTest = {
  name: "about",
  path: "about/about.html"
};

const config = {
  diffDirectory: `${process.cwd()}/docs/images`,
  goldenDirectory: `${process.cwd()}/docs/images`,
  testDirectory: `${process.cwd()}/docs/images`,
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
  tests: path
};

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