/* global require, process */
const test = require('ava');
const {Testophobia} = require('../lib/Testophobia');
const fs = require('fs');
const path = require('path');

const testPath = "examples/basic/tests/about/about-test.js";

let tp;

const config = {
  golden: true,
  diffDirectory: `${process.cwd()}/docs/images`,
  goldenDirectory: `${process.cwd()}/docs/images`,
  testDirectory: `${process.cwd()}/docs/images`,
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

test.before(() => {
  tp = new Testophobia(config);
});

test('ScreenGenerator init - no args', t => {
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

test.after('cleanup', () => {
  fs.unlink(path.join(process.cwd(), 'testophobia.config.js'), () => 0);
});