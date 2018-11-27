/* global require, process */
const test = require('ava');
const {loadConfig} = require('../../lib/utils/load-config');
const {config} = require('../common/config');

const passedDefaults = {
  ...config,
  diffDirectory: `${process.cwd()}`
};

test.serial('loadConfig - null, without default', async t => {
  let i = await loadConfig();
  t.is(typeof(i), 'object');
  t.is(i.hasOwnProperty('baseUrl'), true);
});

test.serial('loadConfig', async t => {
  let i = await loadConfig(passedDefaults);
  t.is(typeof(i), 'object');
  t.is(i.hasOwnProperty('baseUrl'), true);
});