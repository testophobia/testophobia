/* global require, process */
const test = require('ava');
const {Testophobia} = require('../lib/Testophobia');
const fs = require('fs');
const path = require('path');
const {createDirectory, deleteDirectory} = require('../lib/utils');
const {tempPath, config} = require('./common/config');

const testClearPath = `${process.cwd()}/manual-test-screens`;

const tConfig = {
  ...config,
  diffDirectory: `${tempPath}/diff-screens`,
  goldenDirectory: `${tempPath}/golden-screens`,
  testDirectory: `${tempPath}/test-screens`,
};

let initConfig = {
  ...tConfig,
  init: true
};

let tp = new Testophobia(tConfig);

test.before(() => {
  createDirectory(tConfig.goldenDirectory);
  createDirectory(tConfig.testDirectory);
  createDirectory(tConfig.diffDirectory);
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
  let res = tp._checkFlagsAndFiles();
  t.is(res, 0);
});

test('Testophobia - init check', async t => {
  let tpInit = await new Testophobia(initConfig);
  let res = await tpInit._checkFlagsAndFiles();
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
  deleteDirectory(tConfig.diffDirectory);
  deleteDirectory(tConfig.goldenDirectory);
  deleteDirectory(tConfig.testDirectory);
});