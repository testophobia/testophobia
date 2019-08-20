/* global require, process */
const test = require('ava');
const {ScreenCompare} = require('../../lib/ScreenCompare');
const fs = require('fs');
const path = require('path');
const {tempPath, config} = require('./common/config');

const fullPath = `${tempPath}/testophobia-recorder-unscaled.png`;

const exampleTest = {
  name: 'about',
  path: 'about/about.html'
};

const scConfig = {
  ...config,
  golden: false,
  diffDirectory: tempPath,
  goldenDirectory: tempPath,
  testDirectory: tempPath
};

test.before(() => {
  fs.copyFile(path.join(process.cwd(), 'docs/images/testophobia-recorder.png'), fullPath, () => 1);
});

test('ScreenCompare init - no args', t => {
  let c = new ScreenCompare();
  t.is(typeof c, 'object');
});

test('ScreenCompare init - args', async t => {
  let c = await new ScreenCompare(scConfig, exampleTest, 'desktop');
  t.is(c.config.hasOwnProperty('goldenDirectory'), true);
  t.is(c.config.hasOwnProperty('diffDirectory'), true);
  t.is(c.hasOwnProperty('test') && c.test.name === 'about', true);
});

test('ScreenCompare - perform comparison', async t => {
  let c = await new ScreenCompare(scConfig, exampleTest, scConfig.dimensions[0]);
  let d = await c._performComparison(`testophobia-recorder-unscaled.png`);
  t.is(d, 0);
});

test.after(() => {
  fs.unlink(fullPath, () => 1);
});
