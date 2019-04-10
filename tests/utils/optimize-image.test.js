/* global require, process */
const test = require('ava');
const fs = require('fs');
const {optimizeImage} = require('../../lib/utils/optimize-image');
const path = require('path');
const {tempPath} = require('../common/config');

test.before(() => {
  fs.copyFile(path.join(process.cwd(), 'recorder/extension/images/testophobia16.png'), `${tempPath}/testophobia16-unscaled.png`, () => 1);
});

const oldPath = `${tempPath}/testophobia16-unscaled.png`;
const newPath = `${tempPath}/testophobia16.png`;

const dimensions = {
  width: 12,
  height: 12
};

test('optimizeImage - null', t => {
  t.is(optimizeImage(), 0);
});

test('optimizeImage - path', async t => {
  await optimizeImage(oldPath, dimensions, 'png');
  t.is(fs.existsSync(newPath), true);
});

test.after('cleanup', () => {
  fs.unlink(oldPath, () => 0);
  fs.unlink(newPath, () => 0);
});