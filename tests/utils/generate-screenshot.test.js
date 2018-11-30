/* global require */
const test = require('ava');
const fs = require('fs');
const {generateScreenshot} = require('../../lib/utils/generate-screenshot');
const {Browser} = require('../../lib/Browser');
const {browserConfig, tempPath} = require('../common/config');

const pathJpeg = `${tempPath}/screen.jpeg`;
const pathPng = `${tempPath}/screen.png`;
const newPathJpeg = `${tempPath}/screen-scaled.jpeg`;
const newPathPng = `${tempPath}/screen-scaled.png`;
const dimensions = {type: 'desktop', width: 1024, height: 768};
const screenTypeJpeg = 'jpeg';
const screenTypePng = 'png';
const browser = new Browser();
const quality = 90;

test('generateScreenshot - no args', async t => {
  let r = await generateScreenshot();
  t.is(r, 1);
});

test('generateScreenshot - args - wrong screenType', async t => {
  await browser.launch(browserConfig);
  let r = await generateScreenshot(pathPng, dimensions, screenTypeJpeg, browser);
  t.is(r, 1);
});

test('generateScreenshot - args - jpeg', async t => {
  await browser.launch(browserConfig);
  let r = await generateScreenshot(pathJpeg, dimensions, screenTypeJpeg, browser, quality);
  t.is(r, 0);
  t.is(fs.existsSync(newPathJpeg), true);
});

test('generateScreenshot - args - png', async t => {
  await browser.launch(browserConfig);
  let r = await generateScreenshot(pathPng, dimensions, screenTypePng, browser);
  t.is(r, 0);
  t.is(fs.existsSync(newPathPng), true);
});

test.after('cleanup', () => {
  fs.unlink((newPathJpeg), () => 0);
  fs.unlink((newPathPng), () => 0);
});