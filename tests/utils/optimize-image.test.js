/* global require, process */
const test = require('ava');
const fs = require('fs');
const {optimizeImage} = require('../../lib/utils/optimize-image');
const path = require('path');

const imgPath = path.join(process.cwd(), 'tests/temp');

test.before(() => {
  fs.copyFile(path.join(process.cwd(), 'recorder/extension/images/testophobia16.png'), `${imgPath}/testophobia16.png`, () => 1);
});

const oldPath = `${imgPath}/testophobia16.png`;
const newPath = `${imgPath}/testophobia16-scaled.png`;

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