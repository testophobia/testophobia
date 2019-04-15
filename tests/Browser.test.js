/* global require */
const test = require('ava');
const {Browser} = require('../lib/Browser');
const {browserConfig, exampleAction, browserTest} = require('./common/config');

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

test('Browser - perform action - no test passed', async t => {
  await b.launch(browserConfig);
  await b.createPage();
  await b.goto(browserConfig.baseUrl);
  let r = await b.performAction(exampleAction);
  t.is(r, undefined);
});

test('Browser - perform action - action with target that doesnt exist', async t => {
  let newAction = {...exampleAction, target: '#really-obscure-target-selector'};
  await b.launch(browserConfig);
  await b.createPage();
  await b.goto(browserConfig.baseUrl);
  let r = await b.performAction(newAction, browserTest);
  t.is(r, 1);
});

test('Browser - perform action - accurate info', async t => {
  await b.launch(browserConfig);
  await b.createPage();
  await b.goto(browserConfig.baseUrl);
  let r = await b.performAction(exampleAction, browserTest);
  t.is(r, 1);
}); 