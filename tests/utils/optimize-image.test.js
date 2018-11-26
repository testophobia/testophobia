/* global require */
const test = require('ava');
const fs = require('fs');
const {optimizeImage} = require('../../lib/utils/optimize-image');

const oldPath = 'recorder/extension/images/testophobia16.png';
const newPath = 'recorder/extension/images/testophobia16-scaled.png';

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
  fs.unlink(newPath, () => 0);
});