/* global require */
const test = require('ava');
const {Configuration} = require('../lib/Configuration');
const {config, testPath} = require('./common/config');

test('Configuration init - no args', async t => {
  let c = await new Configuration();
  t.is(c.target === 'undefined', true);
  t.is(typeof(c.config) === 'object', true);
  t.is(typeof(c.cli) === 'object', true);
  t.is(c.cli && c.cli.flags.hasOwnProperty('bail'), true);
  t.is(c.config.hasOwnProperty('goldenDirectory'), true);
  t.is(c.config.hasOwnProperty('diffDirectory'), true);
  t.is(c.config.hasOwnProperty('testDirectory'), true);
});

test('Configuration init - args', async t => {
  let c = await new Configuration(config);
  t.is(c.target === testPath, true);
  t.is(typeof(c.config) === 'object', true);
  t.is(c.config.hasOwnProperty('goldenDirectory'), true);
  t.is(c.config.hasOwnProperty('diffDirectory'), true);
  t.is(c.config.hasOwnProperty('testDirectory'), true);
  t.is(c.cli.hasOwnProperty('flags') && c.cli.flags.bail === false, true);
});