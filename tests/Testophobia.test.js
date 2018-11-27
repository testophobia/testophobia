/* global require, process */
const test = require('ava');
const {Testophobia} = require('../lib/Testophobia');
const fs = require('fs');
const path = require('path');
const {createDirectory} = require('../lib/utils');
const {tempPath} = require('./common/temp-path');

const testPath = "examples/basic/tests/about/about-test.js";
const testClearPath = `${process.cwd()}/manual-test-screens`;

const config = {
  golden: true,
  diffDirectory: `${tempPath}/diff-screens`,
  goldenDirectory: `${tempPath}/golden-screens`,
  testDirectory: `${tempPath}/test-screens`,
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
  tests: testPath
};

let initConfig = {
  ...config,
  init: true
};

let tp = new Testophobia(config);

test.before(() => {
  createDirectory(config.goldenDirectory);
  createDirectory(config.testDirectory);
  createDirectory(config.diffDirectory);
  createDirectory(testClearPath);
});

test('Testophobia init - no args', t => {
  let tpBlank = new Testophobia();
  t.is(tpBlank.isGolden === false, false);
});

test('Testophobia init - args', t => {
  t.is(tp.config.hasOwnProperty('goldenDirectory'), true);
  t.is(tp.config.hasOwnProperty('golden') && tp.config.golden === true, true);
  t.is(tp.config.hasOwnProperty('diffDirectory'), true);
  t.is(tp.config.hasOwnProperty('testDirectory'), true);
});

test('Testophobia - golden check', t => {
  let res = tp.checkFlagsAndFiles();
  t.is(res, 0);
});

test('Testophobia - init check', async t => {
  let tpInit = await new Testophobia(initConfig);
  let res = await tpInit.checkFlagsAndFiles();
  t.is(res, 0);
});

test('Testophobia - clear check (no path)', async t => {
  let res = await tp._clearTestophobiaDirectories();
  t.is(res, 0);
});

test('Testophobia - clear check (with path)', async t => {
  let res = await tp._clearTestophobiaDirectories(testClearPath);
  t.is(res, 0);
});

test.after('cleanup', () => {
  fs.unlink(path.join(process.cwd(), 'testophobia.config.js'), () => 0);
});