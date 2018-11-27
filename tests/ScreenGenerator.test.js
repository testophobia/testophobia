/* global require */
const test = require('ava');
const {ScreenGenerator} = require('../lib/ScreenGenerator');
const {createDirectory, deleteDirectory} = require('../lib/utils');
const fs = require('fs');
const {tempPath} = require('./common/temp-path');

const testPath = "examples/basic/tests/about/about-test.js";

const exampleTest = {
  name: "about",
  path: "about/about.html"
};

const path = `${tempPath}/desktop/home`;

const config = {
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
  tests: testPath
};

test.before(() => createDirectory(path));

test('ScreenGenerator init - no args', t => {
  t.throws(() => new ScreenGenerator());
});

test('ScreenGenerator init - args', async t => {
  let c = await new ScreenGenerator(config, exampleTest, 'desktop', tempPath, null, []);
  t.is(c.isGolden === false, false);
  t.is(c.hasOwnProperty('goldenDirectory'), true);
  t.is(c.hasOwnProperty('diffDirectory'), true);
  t.is(c.hasOwnProperty('testDirectory'), true);
  t.is(c.hasOwnProperty('test') && c.test.name === 'about', true);
});

test('ScreenGenerator - generate screen', async t => {
  let c = await new ScreenGenerator(config, exampleTest, 'desktop', tempPath, null, []);
  await c.run();
  t.is(fs.existsSync(`${path}/screen-scaled.png`), true);
});

test.after(() => deleteDirectory(path.substr(0, path.length - 4)));