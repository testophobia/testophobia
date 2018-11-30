/* global require */
const test = require('ava');
const {Browser} = require('../lib/Browser');
const {browserConfig} = require('./common/config');

let b = new Browser();

test('Browser init - generate base config', async t => {
  let r = await b._generateConfig();
  t.is(typeof(r) === 'object', true);
  t.deepEqual(r, {ignoreDefaultArgs: ['--hide-scrollbars']});
});

test('Browser init - generate debug config', async t => {
  let r = await b._generateConfig(true);
  t.is(typeof(r) === 'object', true);
  t.deepEqual(r, {headless: false, slowMo: 250, ignoreDefaultArgs: ['--hide-scrollbars']});
});

test('Browser init - create page', async t => {
  await b.launch(browserConfig);
  await b.createPage();
  t.is(typeof(b.page) === 'object', true);
}); 