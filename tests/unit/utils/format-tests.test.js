/* global require */
const test = require('ava');
const {formatTests} = require('../../../lib/utils/format-tests');
const {testPath, exampleTest} = require('../common/config');

const arrTarget = [testPath];

test('formatTest - no config', async t => {
  let r = await formatTests(null, []);
  t.is(r, 0);
});

test('formatTest - array', async t => {
  let r = await formatTests({}, arrTarget);
  t.is(r.length && r[0].hasOwnProperty('name'), true);
  t.is(Array.isArray(r), true);
});

test('formatTest - empty array', async t => {
  let r = await formatTests({}, []);
  t.is(r, 0);
});

test('formatTest - undefined target', async t => {
  let tgt;
  let r = await formatTests({}, tgt);
  t.is(r, 0);
});

test('formatTest - test object passed', async t => {
  let r = await formatTests({tests: exampleTest}, exampleTest);
  t.is(r.length, 1);
  t.is(r[0].name, 'home');
  t.is(r[0].actions.length, 1);
});

test('formatTest - string', async t => {
  let r = await formatTests({}, testPath);
  t.is(r.length && r[0].hasOwnProperty('name'), true);
  t.is(Array.isArray(r), true);
});
