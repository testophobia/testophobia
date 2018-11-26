/* global require, process */
const test = require('ava');
const {Configuration} = require('../lib/Configuration');

const path = "examples/basic/tests/about/about-test.js";

const config = {
  diffDirectory: `${process.cwd()}`,
  threshold: 0.2,
  baseUrl: 'http://test.com',
  dimensions: [
    {
      type: "desktop",
      width: 1450,
      height: 1088,
      scale: 0.42
    },
    {
      type: "tablet",
      width: 900,
      height: 1200,
      scale: 0.42
    }
  ],
  tests: path
};

test('Configuration init - no args', async t => {
  let c = await new Configuration();
  t.is(c.target === 'undefined', true);
  t.is(typeof(c.config) === 'object', true);
  t.is(c.config.hasOwnProperty('goldenDirectory'), true);
  t.is(c.config.hasOwnProperty('diffDirectory'), true);
  t.is(c.config.hasOwnProperty('testDirectory'), true);
});

test('Configuration init - args', async t => {
  let c = await new Configuration(config);
  t.is(c.target === path, true);
  t.is(typeof(c.config) === 'object', true);
  t.is(c.config.hasOwnProperty('goldenDirectory'), true);
  t.is(c.config.hasOwnProperty('diffDirectory'), true);
  t.is(c.config.hasOwnProperty('testDirectory'), true);
  t.is(c.cli.hasOwnProperty('flags') && c.cli.flags.bail === false, true);
});