/* global require, process */
const fs = require('fs');
const test = require('ava');
const sinon = require('sinon');
const {blackbox} = require('./blackbox-utils');
const tests = require('./files/tests');

blackbox.setupTests(test);

/*******************************************************************************
 *******************************  C O N F I G S  *******************************
 *******************************************************************************/

test.serial('No config file - should fail', t => {
  return new Promise(resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      t.deepEqual(consoleChanges, [{spinner: 'fail'}, {message: '✖  Unable to process config files!', consoleLevel: 'error', chalkColor: 'red'}]);
      resolve();
    });
    const err = new Error();
    err.code = 'MODULE_NOT_FOUND';
    blackbox.useBadConfigFile(err);
    const tp = blackbox.createTestophobia();
  });
});

test.serial('Unparseable config file - should fail', t => {
  return new Promise(resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      t.deepEqual(consoleChanges, [{spinner: 'fail'}, {message: '✖  Unable to process config files!', consoleLevel: 'error', chalkColor: 'red'}]);
      resolve();
    });
    blackbox.useBadConfigFile(new Error('Bad config file!'));
    const tp = blackbox.createTestophobia();
  });
});

test.serial('Bad config file - noexport - should fail', t => {
  return new Promise(resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      t.deepEqual(consoleChanges, [{spinner: 'fail'}, {message: '✖  Unable to process config files!', consoleLevel: 'error', chalkColor: 'red'}]);
      resolve();
    });
    blackbox.useBadConfigFile({});
    const tp = blackbox.createTestophobia();
  });
});

test.serial('User config overrides - should override the base config values', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(true, true);
    const tp = blackbox.createTestophobia(true);
    t.true(consoleChanges.some(c => c.message === '  threshold: 0.5'));
    t.true(consoleChanges.some(c => c.message === '  fileType: "png"'));
    t.true(consoleChanges.some(c => c.message === '  defaultTime: 2068786800000'));
    t.true(consoleChanges.some(c => c.message === '  quality: 80'));
    t.true(consoleChanges.some(c => c.message === '  tests: "sandbox/tests/**/*-test.js"'));
    resolve();
  });
});

test.serial('Test target - CLI input tests path', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(true, true, {input: ['cfg/path/to/tests']});
    const tp = blackbox.createTestophobia(true);
    t.true(consoleChanges.some(c => c.message === '  tests: "cfg/path/to/tests"'));
    resolve();
  });
});

test.serial('No golden dir exists - should fail', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      t.deepEqual(consoleChanges, [
        {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
        {spinner: 'fail'},
        {message: '✖  No Golden Images to Compare.', consoleLevel: 'error', chalkColor: 'red'}
      ]);
      resolve();
    });
    await blackbox.applyConfigFile(true);
    const tp = blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
  });
});

test.serial('No test files exist - should fail', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      t.deepEqual(consoleChanges, [
        {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
        {spinner: 'fail'},
        {message: '✖  No test files found! Check your config or input path.', consoleLevel: 'error', chalkColor: 'red'}
      ]);
      resolve();
    });
    await blackbox.applyConfigFile();
    const tp = blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
  });
});

/*******************************************************************************
 ***********************  B A D   T E S T   C O N F I G  ***********************
 *******************************************************************************/

test.serial('Test - no goldens directory found - should fail', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      t.deepEqual(consoleChanges, [
        {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
        {spinner: 'start'},
        {spinner: 'fail'},
        {message: '✖  Missing Golden Images: ./sandbox/golden-screens/desktop/home', consoleLevel: 'error', chalkColor: 'red'}
      ]);
      resolve();
    });
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles([tests.test1]);
    const tp = blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
  });
});

test.serial('Test - bad baseUrl (slashes)', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      t.deepEqual(consoleChanges, [
        {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
        {spinner: 'start'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 2 pending]'},
        {spinner: 'fail'},
        {
          message: '✖  Error: baseUrl should only contain a domain name, but a path was supplied. Handle all pathing in test files.',
          consoleLevel: 'error',
          chalkColor: 'red'
        }
      ]);
      resolve();
    });
    await blackbox.applyConfigFile();
    const tp = prepareTestRun([tests.test1]);
    tp.config.baseUrl = 'test://o/phobia';
    await blackbox.runTestophobia(tp);
  });
});

test.serial('Test - bad baseUrl (hash)', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      t.deepEqual(consoleChanges, [
        {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
        {spinner: 'start'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 2 pending]'},
        {spinner: 'fail'},
        {
          message: '✖  Error: baseUrl should only contain a domain name, but a path was supplied. Handle all pathing in test files.',
          consoleLevel: 'error',
          chalkColor: 'red'
        }
      ]);
      resolve();
    });
    await blackbox.applyConfigFile();
    const tp = prepareTestRun([tests.test1]);
    tp.config.baseUrl = 'test://o.phobia#foo';
    await blackbox.runTestophobia(tp);
  });
});

test.serial('Test - unreachable url', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.stubFatalExit(() => {
      t.deepEqual(consoleChanges, [
        {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
        {spinner: 'start'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 2 pending]'},
        {spinner: 'fail'},
        {
          message: '✖  baseUrl supplied cannot be reached: test://o.phobia',
          consoleLevel: 'error',
          chalkColor: 'red'
        }
      ]);
      resolve();
    });
    await blackbox.applyConfigFile();
    const testConfig = [tests.test1][0];
    delete testConfig.contents.path;
    const tp = prepareTestRun([testConfig]);
    tp.config.baseUrl = 'test://o.phobia';
    await blackbox.runTestophobia(tp);
  });
});

test.serial('Test - golden not available for tests (w/ bail)', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles([tests.test1]);
    blackbox.prepareGoldens('desktop/home', true);
    blackbox.prepareGoldens('mobile/home', true);
    const tp = blackbox.createTestophobia();
    tp.config.bail = true;
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 2 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m1 failed\u001b[39m | 1 pending]'},
      {spinner: 'message', text: ' \u001b[36mBailed\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m1 failed\u001b[39m | 1 pending]'},
      {spinner: 'fail'},
      {message: '\u001b[31m   Test Failure: \u001b[39mhome (desktop) none', consoleLevel: 'error', chalkColor: undefined}
    ]);
    resolve();
  });
});

/*******************************************************************************
 ****************************  G O L D E N   R U N  ****************************
 *******************************************************************************/

test.serial('Generate goldens', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(false, false, {flags: {golden: true}});
    blackbox.writeTestFiles([tests.test2]);
    const tp = blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m0 done\u001b[39m | 14 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m1 done\u001b[39m | 13 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m2 done\u001b[39m | 12 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m3 done\u001b[39m | 11 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m4 done\u001b[39m | 10 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m5 done\u001b[39m | 9 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m6 done\u001b[39m | 8 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m7 done\u001b[39m | 7 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m8 done\u001b[39m | 6 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m9 done\u001b[39m | 5 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m10 done\u001b[39m | 4 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m11 done\u001b[39m | 3 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m12 done\u001b[39m | 2 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m13 done\u001b[39m | 1 pending]'},
      {spinner: 'message', text: ' \u001b[36mGeneration Complete\u001b[39m [\u001b[32m14 done\u001b[39m]'},
      {spinner: 'succeed'}
    ]);
    const desktopFiles = blackbox.getFiles('./sandbox/golden-screens/desktop/home');
    t.deepEqual(desktopFiles, desktopGoldenFiles);
    const mobileFiles = blackbox.getFiles('./sandbox/golden-screens/mobile/home');
    t.deepEqual(mobileFiles, mobileGoldenFiles);
    resolve();
  });
});

/*******************************************************************************
 *********************************  T E S T S  *********************************
 *******************************************************************************/

test.serial('Test - basic test', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    const tp = prepareTestRun([tests.test2]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 14 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m1 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 13 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m2 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 12 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m3 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 11 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m4 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 10 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m5 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 9 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m6 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 8 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m7 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 7 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m8 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 6 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m9 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 5 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m10 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 4 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m11 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 3 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m12 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 2 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m13 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 1 pending]'},
      {spinner: 'message', text: ' \u001b[36mTesting Complete\u001b[39m [\u001b[32m14 passed\u001b[39m | \u001b[31m0 failed\u001b[39m]'},
      {spinner: 'succeed'}
    ]);
    const desktopFiles = blackbox.getFiles('./sandbox/golden-screens/desktop/home');
    t.deepEqual(desktopFiles, desktopGoldenFiles);
    const mobileFiles = blackbox.getFiles('./sandbox/golden-screens/mobile/home');
    t.deepEqual(mobileFiles, mobileGoldenFiles);
    resolve();
  });
});

/*******************************************************************************
 *********************************  C L E A R  *********************************
 *******************************************************************************/

test.serial('clear - particular directory', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(false, false, {input: ['sandbox/golden-screens/mobile/**/*'], flags: {clear: true}});
    const tp = prepareTestRun([tests.test1]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {message: '\u001b[33m⚠  sandbox/golden-screens/mobile/**/* cleared.\u001b[39m', consoleLevel: 'warn', chalkColor: undefined}
    ]);
    const desktopFiles = blackbox.getFiles('./sandbox/golden-screens/desktop/home');
    t.deepEqual(desktopFiles, desktopGoldenFiles);
    const mobileFiles = blackbox.getFiles('./sandbox/golden-screens/mobile/home');
    t.deepEqual(mobileFiles, []);
    resolve();
  });
});

test.serial('clear - all directories', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(false, false, {flags: {clear: true}});
    const tp = prepareTestRun([tests.test1]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {message: '\u001b[33m⚠  Testophobia directories cleared.\u001b[39m', consoleLevel: 'warn', chalkColor: undefined}
    ]);
    t.false(fs.existsSync('./sandbox/test-screens'));
    t.false(fs.existsSync('./sandbox/diffs'));
    const desktopFiles = blackbox.getFiles('./sandbox/golden-screens/desktop/home');
    t.deepEqual(desktopFiles, desktopGoldenFiles);
    const mobileFiles = blackbox.getFiles('./sandbox/golden-screens/mobile/home');
    t.deepEqual(mobileFiles, mobileGoldenFiles);
    resolve();
  });
});

test.serial('clear - all directories w/ golden', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(false, false, {flags: {clear: true, golden: true}});
    const tp = prepareTestRun([tests.test1]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {message: '\u001b[33m⚠  Testophobia directories cleared.\u001b[39m', consoleLevel: 'warn', chalkColor: undefined}
    ]);
    t.false(fs.existsSync('./sandbox/test-screens'));
    t.false(fs.existsSync('./sandbox/diffs'));
    t.false(fs.existsSync('./sandbox/golden-screens'));
    resolve();
  });
});

/*******************************************************************************
 **********************************  Internal  *********************************
 *******************************************************************************/

const prepareTestRun = tests => {
  blackbox.writeTestFiles(tests);
  blackbox.prepareGoldens('desktop/home');
  blackbox.prepareGoldens('mobile/home');
  return blackbox.createTestophobia();
};

const desktopGoldenFiles = [
  '2fm1HKw4gcoXhLVNxWp77htEfe9TDSbwB3wFFV4XcgDgeS7EkhYSkVxrKqLi8V.jpeg',
  '4Tc5tHFf96q46SVjWdvi5Ltby.jpeg',
  '9nLGvMUKhvYNzLezgt.jpeg',
  'GGRrZLjhLkj6f1Xpdoz4J4rpDd.jpeg',
  'M2gR52Jm6N2s55oivx7fMfGdncpVHewcDwmw5CXLkdxj4.jpeg',
  'NX2ueh6nJoM5kmkbm1mhcLkLv8gLxtn9BJ683FQGo5tp2.jpeg',
  'manifest'
];

const mobileGoldenFiles = [
  '2fm1HKw4gcoXhLVNxWp77htEfe9TDSbwB3wFFV4XcgDgeS7EkhYSkVxrKqLi8V.jpeg',
  '3G4d3v7SFaqWUTW1AeYwB3MrST2BHmcVo8ToqwZSLPRQtjTweCr.jpeg',
  '4Tc5tHFf96q46SVjWdvi5Ltby.jpeg',
  '9nLGvMUKhvYNzLezgt.jpeg',
  'DLuoppmPYDyKPXRxRQoLdK57MC.jpeg',
  'GGRrZLjhLkj6f1Xpdoz4J4rpDd.jpeg',
  'GGRrZLjhLkj6f1Xpdoz4J4tVdH.jpeg',
  'GGRrZLjhLkj6f1Xpdoz4J6LoVy.jpeg',
  'manifest'
];
