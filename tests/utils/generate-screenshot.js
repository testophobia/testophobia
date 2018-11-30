/* global require */
const test = require('ava');
const {generateScreenshot} = require('../lib/utils/generate-screenshot');

test('generateScreenshot - no args', t => {
  t.throws(() => generateScreenshot());
});

test('generateScreenshot', t => {
  let r = generateScreenshot();
  t.is(r, 0);
});
