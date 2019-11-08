/* global require */
const test = require('ava');
const {Viewer} = require('../../lib/Viewer');
const {config} = require('./common/config');

let v = new Viewer(config);

test('Viewer init - no args', t => {
  let r = new Viewer();
  t.is(typeof r === 'object', true);
});

test('Viewer - initialize config, no args', t => {
  let r = v._initializeConfig();
  t.is(typeof r === 'object', true);
  t.is(r.target === 'undefined', true);
});

test('Viewer - initialize config, pass example config', t => {
  let r = v._initializeConfig(config);
  t.is(typeof r === 'object', true);
  t.is(r.target === 'examples/basic/tests/about/about-test.js', true);
});
