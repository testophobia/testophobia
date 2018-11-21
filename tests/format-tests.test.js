/* global require */
const test = require('ava');
const {formatTests} = require('../lib/utils/format-tests');

const mockConfig = {

};

const arrTarget = [
  "../examples/basic/tests/about/about-test.js"
];

test('formatTest - empty array', async t => {
  let r = await formatTests(null, []);
  t.is(r, 0);
});

test('formatTest - array', async t => {
  let r = await formatTests(mockConfig, arrTarget);
  t.is(r, 0);
});