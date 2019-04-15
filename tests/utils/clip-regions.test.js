/* global require */
const test = require('ava');
const {getClipRegion, getActionClipRegion} = require('../../lib/utils/clip-regions');
const {config, exampleTest, exampleAction} = require('../common/config');

const clipRegionsConfig = {
  ...config,
  clipRegions: [
    {
      type: 'desktop',
      left: 256,
      top: 64
    },
    {
      type: 'tablet',
      left: 0,
      top: 64
    }
  ]
};

const clipRegionsTest = {
  ...exampleTest,
  clipRegions: [
    {
      type: 'tablet',
      left: 80,
      top: 95
    }
  ]
};

const actionClipRegionsTest = {
  ...exampleTest,
  actionsClipRegions: [
    {
      type: 'tablet',
      left: 80,
      top: 95
    }
  ]
};

const clipRegionsAction = {
  ...exampleAction,
  clipRegions: [
    {
      type: 'tablet',
      left: 80,
      top: 95
    }
  ]
};

test('getClipRegion - null', t => {
  t.throws(() => getClipRegion());
});

test('getClipRegion - no clip regions in config or test', t => {
  let r = getClipRegion(config, exampleTest);
  t.is(r, undefined);
});

test('getClipRegion - missing screenType', t => {
  let r = getClipRegion(clipRegionsConfig, exampleTest);
  t.is(r, undefined);
});

test('getClipRegion - undefined when unmatched screentype', t => {
  let r = getClipRegion(clipRegionsConfig, exampleTest, 'mobile');
  t.is(r, undefined);
});

test('getClipRegion - config clipRegion', t => {
  let r = getClipRegion(clipRegionsConfig, exampleTest, 'desktop');
  t.is(typeof r === 'object', true);
  t.is(r.left, 256);
  t.is(r.top, 64);
});

test('getClipRegion - test clipRegion', t => {
  let r = getClipRegion(config, clipRegionsTest, 'tablet');
  t.is(typeof r === 'object', true);
  t.is(r.left, 80);
  t.is(r.top, 95);
});

test('getActionClipRegion - null', t => {
  t.throws(() => getActionClipRegion());
});

test('getActionClipRegion - no clip regions in action or test', t => {
  let r = getActionClipRegion(exampleAction, exampleTest);
  t.is(r, undefined);
});

test('getActionClipRegion - missing screenType', t => {
  let r = getActionClipRegion(clipRegionsAction, exampleTest);
  t.is(r, undefined);
});

test('getActionClipRegion - undefined when unmatched screentype', t => {
  let r = getActionClipRegion(clipRegionsAction, exampleTest, 'desktop');
  t.is(r, undefined);
});

test('getActionClipRegion - action clipRegion', t => {
  let r = getActionClipRegion(clipRegionsAction, exampleTest, 'tablet');
  t.is(typeof r === 'object', true);
  t.is(r.left, 80);
  t.is(r.top, 95);
});

test('getActionClipRegion - test actionsClipRegions', t => {
  let r = getActionClipRegion(exampleAction, actionClipRegionsTest, 'tablet');
  t.is(typeof r === 'object', true);
  t.is(r.left, 80);
  t.is(r.top, 95);
});