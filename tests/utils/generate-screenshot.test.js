/* global require */
const test = require('ava');
const fs = require('fs');
const {generateScreenshot} = require('../../lib/utils/generate-screenshot');
const {Browser} = require('../../lib/Browser');
const {browserConfig, tempPath} = require('../common/config');

const pathJpeg = `${tempPath}/screen-unscaled.jpeg`;
const pathPng = `${tempPath}/screen-unscaled.png`;
const newPathJpeg = `${tempPath}/screen.jpeg`;
const newPathPng = `${tempPath}/screen.png`;
const dimensions = {type: 'desktop', width: 1024, height: 768};
const clipRegions = [{type: 'desktop', top: 0, left: 0, right: 1024, bottom: 768}];
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
  let r = await generateScreenshot(pathPng, dimensions, clipRegions, screenTypeJpeg, browser);
  t.is(r, 1);
});

test('generateScreenshot - args - jpeg', async t => {
  await browser.launch(browserConfig);
  let r = await generateScreenshot(pathJpeg, dimensions, clipRegions, screenTypeJpeg, browser, quality);
  t.is(r, 0);
  t.is(fs.existsSync(newPathJpeg), true);
});

test('generateScreenshot - args - png', async t => {
  await browser.launch(browserConfig);
  let r = await generateScreenshot(pathPng, dimensions, clipRegions, screenTypePng, browser);
  t.is(r, 0);
  t.is(fs.existsSync(newPathPng), true);
});

test.after('cleanup', () => {
  fs.unlink((newPathJpeg), () => 0);
  fs.unlink((newPathPng), () => 0);
});