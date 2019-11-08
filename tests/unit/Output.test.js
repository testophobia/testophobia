/* global require */
const test = require('ava');
const {Output} = require('../../lib/Output');
const {config, exampleTest} = require('./common/config');

let c = new Output(config);

test('Output init - no args', t => {
  t.throws(() => new Output());
});

test('Output init', t => {
  t.is(typeof c.spinner, 'object');
  t.is(c.total, 0);
});

test('Output - calculate total', t => {
  c.calculateTotalTests(exampleTest);
  t.is(c.total, 3);
});

test('Output - resolve action counts', async t => {
  let count = await c._resolveActionCounts(exampleTest[0]);
  t.is(count, 1);
});

test('Output - increment test count - no args', t => {
  c.incrementTestCount();
  t.is(c.currentTest, 1);
});

test('Output - increment test count - arg', t => {
  c.incrementTestCount(4);
  t.is(c.currentTest, 5);
});

test('Output - resolve dimension counts - no dimension overrides', async t => {
  let count = await c._resolveDimensionCounts(exampleTest[0]);
  t.is(count, 2);
});

test('Output - resolve dimension counts - dimension overrides - override existing dimension', async t => {
  exampleTest[0].dimensions = [
    {
      type: 'desktop',
      height: 100,
      width: 1800
    }
  ];
  let count = await c._resolveDimensionCounts(exampleTest[0]);
  t.is(count, 2);
  t.is(exampleTest[0].dimensions[0].width, 1800);
});

test('Output - resolve dimension counts - dimension overrides - new dimension', async t => {
  exampleTest[0].dimensions = [
    {
      type: 'desktop - ultra-wide',
      height: 100,
      width: 1800
    }
  ];
  let count = await c._resolveDimensionCounts(exampleTest[0]);
  t.is(count, 3);
});
