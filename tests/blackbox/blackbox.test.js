/* global require, process */
const test = require('ava');
const sinon = require('sinon');
const {blackbox} = require('./blackbox-utils');

blackbox.setupTests(test);

test.serial('No config file - should fail', t => {
  return new Promise(resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      t.deepEqual(consoleChanges, [{spinner: 'fail'}, {message: '✖  testophobia.config.js not found!', consoleLevel: 'error', chalkColor: 'red'}]);
      resolve();
    });
    const tp = blackbox.createTestophobia();
  });
});

test.serial('Unparseable config file - should fail', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      t.deepEqual(consoleChanges, [{spinner: 'fail'}, {message: '✖  Error loading testophobia config file', consoleLevel: 'error', chalkColor: 'red'}]);
      resolve();
    });
    await blackbox.useBadConfigFile('bad-config-1.config.js');
    const tp = blackbox.createTestophobia();
  });
});

test.serial('Bad config file - noexport - should fail', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      t.deepEqual(consoleChanges, [{spinner: 'fail'}, {message: '✖  testophobia config file must have a default export, using ES module syntax', consoleLevel: 'error', chalkColor: 'red'}]);
      resolve();
    });
    await blackbox.useBadConfigFile('bad-config-2.config.js');
    const tp = blackbox.createTestophobia();
  });
});

test.serial('No golden dir exists - should fail', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      console.log(JSON.stringify(consoleChanges, null, 2));
      console.log('I should only write once!');
      t.deepEqual(consoleChanges, [
        {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
        {spinner: 'fail'},
        {message: '✖  No Golden Images to Compare.', consoleLevel: 'error', chalkColor: 'red'}
      ]);
      resolve();
    });
    await blackbox.applyConfigFile(null, true);
    console.log('running test 1');
    const tp = blackbox.createTestophobia();
    await tp.run();
  });
});

test.serial('No test files exist - should fail', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      console.log('I also should just write once!');
      t.deepEqual(consoleChanges, [
        {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
        {spinner: 'fail'},
        {message: '✖  No test files found! Check your config or input path.', consoleLevel: 'error', chalkColor: 'red'}
      ]);
      resolve();
    });
    await blackbox.applyConfigFile();
    console.log('running test 2');
    const tp = blackbox.createTestophobia();
    await tp.run();
  });
});


