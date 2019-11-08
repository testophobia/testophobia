/* global require */
const test = require('ava');
const {config, exampleTest} = require('../common/config');
const {handleDimensions} = require('../../../lib/utils/handle-dimensions');

test.serial('handleDimensions - no overrides', async t => {
  let count = await handleDimensions(config.dimensions, exampleTest[0]);
  t.is(count.length, 2);
});

test.serial('handleDimensions - override', async t => {
  let newTest = exampleTest;
  newTest[0].dimensions = [
    {
      type: 'desktop',
      width: 300,
      height: 1200
    }
  ];
  let newDim = await handleDimensions(config.dimensions, newTest[0]);
  t.is(newDim.length, 2);
  t.is(newDim[0].height, 1200);
});

test('handleDimensions - addition', async t => {
  let newTest = exampleTest;
  newTest[0].dimensions = [
    {
      type: 'desktop - new version',
      width: 300,
      height: 200
    }
  ];
  let count = await handleDimensions(config.dimensions, newTest[0]);
  t.is(count.length, 3);
});
