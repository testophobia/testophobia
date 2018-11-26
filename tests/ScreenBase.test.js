/* global require, process */
const test = require('ava');
const {ScreenBase} = require('../lib/ScreenBase');

const path = "examples/basic/tests/about/about-test.js";

const config = {
  diffDirectory: `${process.cwd()}`,
  goldenDirectory: `${process.cwd()}`,
  testDirectory: `${process.cwd()}`,
  quality: 'jpeg',
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

test('ScreenBase init - no args', t => {
  t.throws(() => new ScreenBase());
});

test('ScreenBase init - args', async t => {
  let c = await new ScreenBase(config);
  t.is(c.isGolden === false, true);
  t.is(c.hasOwnProperty('goldenDirectory') && c.goldenDirectory === process.cwd(), true);
  t.is(c.hasOwnProperty('diffDirectory') && c.diffDirectory === process.cwd(), true);
  t.is(c.hasOwnProperty('testDirectory') && c.testDirectory === process.cwd(), true);
});

test('ScreenBase cleanTargetName - null', async t => {
  let c = await new ScreenBase(config);
  t.is(c.cleanTargetName(null), 0);
});

test('ScreenBase cleanTargetName - string', async t => {
  let c = await new ScreenBase(config);
  t.is(c.cleanTargetName('#some-element.sibling #id'), '-some-element-sibling--id');
});