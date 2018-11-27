/* global require, process */
const test = require('ava');
const path = require('path');
const {retrieveImageData} = require('../../lib/utils/retrieve-image-data');
const fs = require('fs');

const imgPath = path.join(process.cwd(), 'tests/temp');
const fullPath = `${imgPath}/testophobia16.png`;

test.before(() => {
  fs.copyFile(path.join(process.cwd(), 'recorder/extension/images/testophobia16.png'), fullPath, () => 1);
});

test('retrieveImageData - null', t => {
  t.is(retrieveImageData(null), 0);
});

test('retrieveImageData - wrong filetype', async t => {
  let i = await retrieveImageData(fullPath, 'jpeg');
  t.is(i, 0);
});

test('retrieveImageData - invalid path', async t => {
  let i = await retrieveImageData(path.join(process.cwd(), 'test/wrong/path.png'), 'png');
  t.is(i, 0);
});

test('retrieveImageData - path', async t => {
  let i = await retrieveImageData(fullPath, 'png');
  t.is(typeof(i), 'object');
  t.is(i.width, 16);
});

test.after(() => {
  fs.unlink(fullPath, () => 1);
});