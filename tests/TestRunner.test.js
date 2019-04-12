/* global require */
const test = require('ava');
const {TestRunner} = require('../lib/TestRunner');
const {config, exampleTest} = require('./common/config');

const dim = {
  type: 'desktop',
  width: 100,
  height: 50
};

let tr = new TestRunner(config, exampleTest, dim, './');

test('TestRunner - init with no args', t => {
  t.throws(() => new TestRunner());
});

test('TestRunner - init, no output args', t => {
  let r = new TestRunner(config, exampleTest, dim, './');
  t.is(typeof r === 'object', true);
  t.is(r.config.fileType === 'png', true);
});

test('TestRunner - init browser', async t => {
  let r = await tr._initBrowser(dim);
  t.is(r, undefined);
});

test('TestRunner - _checkBaseUrl - bad domain example', t => {
  let badCfg = {...config, baseUrl: 'http://google.com/sub/route'};
  let tst = new TestRunner(badCfg, exampleTest, dim, './');
  t.throws(() => tst._checkBaseUrl());
});

test('TestRunner - _checkBaseUrl - good domain example', t => {
  let r = tr._checkBaseUrl();
  t.is(r, undefined);
});

test('TestRunner - _validateUniqueActionDescriptions no test actions', t => {
  let r = tr._validateUniqueActionDescriptions();
  t.is(r, undefined);
});


