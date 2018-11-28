/* global require */
const test = require('ava');
const {ScreenBase} = require('../lib/ScreenBase');
const {config} = require('./common/config');

test('ScreenBase init - no args', t => {
  t.throws(() => new ScreenBase());
});

test('ScreenBase init - args', async t => {
  let c = await new ScreenBase(config);
  t.is(c.isGolden === true, true);
  t.is(c.hasOwnProperty('goldenDirectory'), true);
  t.is(c.hasOwnProperty('diffDirectory'), true);
  t.is(c.hasOwnProperty('testDirectory'), true);
});

test('ScreenBase cleanTargetName - null', async t => {
  let c = await new ScreenBase(config);
  t.is(c.cleanTargetName(null), 0);
});

test('ScreenBase cleanTargetName - string', async t => {
  let c = await new ScreenBase(config);
  t.is(c.cleanTargetName('#some-element.sibling #id'), '-some-element-sibling--id');
});