/* global require, process */
const test = require('ava');
const path = require('path');
const {retrieveImageData} = require('../lib/utils/retrieve-image-data');

test('retrieveImageData - null', t => {
  t.is(retrieveImageData(null), 0);
});

test('retrieveImageData - wrong filetype', async t => {
  let i = await retrieveImageData(path.join(process.cwd(), 'recorder/extension/images/testophobia16.png'), 'jpeg');
  t.is(i, 0);
});

test('retrieveImageData - invalid path', async t => {
  let i = await retrieveImageData(path.join(process.cwd(), 'test/wrong/path.png'), 'png');
  t.is(i, 0);
});

test('retrieveImageData - path', async t => {
  let i = await retrieveImageData(path.join(process.cwd(), 'recorder/extension/images/testophobia16.png'), 'png');
  t.is(typeof(i), 'object');
});