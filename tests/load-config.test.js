/* global require, process */
const test = require('ava');
const {loadConfig} = require('../lib/utils/load-config');

const passedDefaults = {
  diffDirectory: `${process.cwd()}`,
  quality: 'png',
  threshold: 0.2,
  baseUrl: 'http://test.com',
  dimensions: {
    desktop: {
      height: 300,
      width: 200
    }
  }
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