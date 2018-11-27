/* global require */
const test = require('ava');
const {Browser} = require('../lib/Browser');

let b = new Browser();

const config = {
  baseUrl: 'http://google.com',
  dimensions: {
    height: 300,
    width: 200
  },
  debug: false,
  defaultTime: false
};

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
  await b.launch(config);
  await b.createPage();
  t.is(typeof(b.page) === 'object', true);
}); 