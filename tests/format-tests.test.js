/* global require */
const test = require('ava');
const {formatTests} = require('../lib/utils/format-tests');

const path = "examples/basic/tests/about/about-test.js";

const arrTarget = [
  path
];

test('formatTest - empty array', async t => {
  let r = await formatTests(null, []);
  t.is(r, 0);
});

test('formatTest - array', async t => {
  let r = await formatTests({}, arrTarget);
  t.is(r.length && r[0].hasOwnProperty('name'), true);
  t.is(Array.isArray(r), true);
});

test('formatTest - string', async t => {
  let r = await formatTests({}, path);
  t.is(r.length && r[0].hasOwnProperty('name'), true);
  t.is(Array.isArray(r), true);
});