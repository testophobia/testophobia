/* global require, process */
const test = require('ava');
const sinon = require('sinon');
const {setupTests, createTestophobia, dumpConsole} = require('./blackbox-utils');

setupTests(test);

test.serial('No goldens exist - should fail on golden check', async t => {
  let tp = createTestophobia(t);
  sinon
    .stub(process, 'exit')
    .withArgs(1)
    .callsFake(code => {
      t.deepEqual(tp.consoleChanges, [
        {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
        {spinner: 'fail'},
        {message: '✖  No Golden Images to Compare.', consoleLevel: 'error', chalkColor: 'red'}
      ]);
    });
  await tp.run();
});
