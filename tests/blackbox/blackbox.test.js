/* global require, process */
const fs = require('fs');
const test = require('ava');
const blackbox = require('./blackbox-utils');
const tests = require('./files/tests');
const {copyFileOrDirectory} = require('../../lib/utils');

blackbox.setupTests(test);

/*******************************************************************************
 *******************************  C O N F I G S  *******************************
 *******************************************************************************/

test.serial('Config - no config file', t => {
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

test.serial('Config - unparseable config file', t => {
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

test.serial('Config - bad config file (noexport)', t => {
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

test.serial('Config - user config overrides', t => {
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

test.serial('Config - tests path CLI override', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(true, true, {input: ['cfg/path/to/tests']});
    const tp = blackbox.createTestophobia(true);
    t.true(consoleChanges.some(c => c.message === '  tests: "cfg/path/to/tests"'));
    resolve();
  });
});

test.serial('Config - No golden dir', t => {
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

test.serial('Config - no test files exist', t => {
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
 ****************************  G O L D E N   R U N  ****************************
 *******************************************************************************/

test.serial('Golden - no actions', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(false, false, {flags: {golden: true}});
    blackbox.writeTestFiles([tests.test1]);
    const tp = blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m0 done\u001b[39m | 2 pending]'},
      {spinner: 'message', text: ' \u001b[36mGenerating Goldens\u001b[39m [\u001b[32m1 done\u001b[39m | 1 pending]'},
      {spinner: 'message', text: ' \u001b[36mGeneration Complete\u001b[39m [\u001b[32m2 done\u001b[39m]'},
      {spinner: 'succeed'}
    ]);
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/desktop/home'), tests.test1.goldens.desktop);
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/mobile/home'), tests.test1.goldens.mobile);
    t.deepEqual(blackbox.getFiles('./sandbox/diffs'), []);
    resolve();
  });
});

test.serial('Golden - with actions', t => {
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
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/desktop/home'), tests.test2.goldens.desktop);
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/mobile/home'), tests.test2.goldens.mobile);
    t.deepEqual(blackbox.getFiles('./sandbox/diffs'), []);
    resolve();
  });
});

/*******************************************************************************
 ***********************  B A D   T E S T   C O N F I G  ***********************
 *******************************************************************************/

test.serial('Bad Test - no goldens directory found', t => {
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

test.serial('Bad Test - bad baseUrl (slashes)', t => {
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
    const tp = blackbox.prepareTestRun([tests.test1]);
    tp.config.baseUrl = 'test://o/phobia';
    await blackbox.runTestophobia(tp);
  });
});

test.serial('Bad Test - bad baseUrl (hash)', t => {
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
    const tp = blackbox.prepareTestRun([tests.test1]);
    tp.config.baseUrl = 'test://o.phobia#foo';
    await blackbox.runTestophobia(tp);
  });
});

test.serial('Bad Test - unreachable url', t => {
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
    const tp = blackbox.prepareTestRun([testConfig]);
    tp.config.baseUrl = 'test://o.phobia';
    await blackbox.runTestophobia(tp);
  });
});

test.serial('Bad Test - golden not available (w/ bail)', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles([tests.test1]);
    blackbox.prepareGoldens(null);
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
 *********************************  T E S T S  *********************************
 *******************************************************************************/

test.serial('Test - home page - no actions', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    const tp = blackbox.prepareTestRun([tests.test1]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 2 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m1 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 1 pending]'},
      {spinner: 'message', text: ' \u001b[36mTesting Complete\u001b[39m [\u001b[32m2 passed\u001b[39m | \u001b[31m0 failed\u001b[39m]'},
      {spinner: 'succeed'}
    ]);
    t.deepEqual(blackbox.getFiles('./sandbox/diffs'), []);
    resolve();
  });
});

test.serial('Test - home page - no actions - failure', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles([tests.test1]);
    copyFileOrDirectory(`./files/goldens/test4/desktop/contact`, `./sandbox/golden-screens/desktop/home`);
    copyFileOrDirectory(`./files/goldens/test4/mobile/contact`, `./sandbox/golden-screens/mobile/home`);
    const tp = blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
    blackbox.dumpConsole();
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 2 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m1 failed\u001b[39m | 1 pending]'},
      {spinner: 'message', text: ' \u001b[36mTesting Complete\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m2 failed\u001b[39m]'},
      {spinner: 'succeed'},
      {message: '\u001b[31m   Test Failure: \u001b[39mhome (desktop) none', consoleLevel: 'error', chalkColor: undefined},
      {message: '\u001b[31m   Test Failure: \u001b[39mhome (mobile) none', consoleLevel: 'error', chalkColor: undefined}
    ]);
    const files = blackbox.getFiles('./sandbox/diffs');
    t.true(files.includes('results.json'));
    t.true(files.some(f => f.startsWith('home-desktop--')));
    t.true(files.some(f => f.startsWith('home-mobile--')));
    resolve();
  });
});

test.serial('Test - home page', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    const tp = blackbox.prepareTestRun([tests.test2]);
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
    t.deepEqual(blackbox.getFiles('./sandbox/diffs'), []);
    resolve();
  });
});

test.serial('Test - home page - clip regions, scale, exclude, and png', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles([tests.test3]);
    const tp = blackbox.prepareTestRun([tests.test3]);
    tp.config.fileType = 'png';
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 3 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m1 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 2 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m2 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 1 pending]'},
      {spinner: 'message', text: ' \u001b[36mTesting Complete\u001b[39m [\u001b[32m3 passed\u001b[39m | \u001b[31m0 failed\u001b[39m]'},
      {spinner: 'succeed'}
    ]);
    t.deepEqual(blackbox.getFiles('./sandbox/diffs'), []);
    resolve();
  });
});

test.serial('Test - contact page', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles([tests.test4]);
    const tp = blackbox.prepareTestRun([tests.test4]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 22 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m1 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 21 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m2 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 20 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m3 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 19 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m4 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 18 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m5 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 17 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m6 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 16 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m7 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 15 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m8 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 14 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m9 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 13 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m10 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 12 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m11 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 11 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m12 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 10 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m13 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 9 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m14 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 8 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m15 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 7 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m16 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 6 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m17 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 5 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m18 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 4 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m19 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 3 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m20 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 2 pending]'},
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m21 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 1 pending]'},
      {spinner: 'message', text: ' \u001b[36mTesting Complete\u001b[39m [\u001b[32m22 passed\u001b[39m | \u001b[31m0 failed\u001b[39m]'},
      {spinner: 'succeed'}
    ]);
    t.deepEqual(blackbox.getFiles('./sandbox/diffs'), []);
    resolve();
  });
});

test.serial('Test - parallel home and contact', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles([tests.test2, tests.test4]);
    const tp = blackbox.prepareTestRun([tests.test2, tests.test4]);
    tp.config.maxParallel = 2;
    blackbox.stubParallel(tp, () => {
      t.deepEqual(consoleChanges, [
        {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
        {spinner: 'start'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 36 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m1 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 35 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m2 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 34 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m3 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 33 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m4 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 32 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m5 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 31 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m6 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 30 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m7 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 29 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m8 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 28 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m9 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 27 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m10 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 26 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m11 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 25 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m12 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 24 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m13 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 23 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m14 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 22 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m15 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 21 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m16 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 20 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m17 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 19 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m18 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 18 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m19 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 17 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m20 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 16 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m21 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 15 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m22 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 14 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m23 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 13 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m24 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 12 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m25 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 11 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m26 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 10 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m27 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 9 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m28 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 8 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m29 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 7 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m30 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 6 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m31 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 5 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m32 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 4 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m33 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 3 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m34 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 2 pending]'},
        {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m35 passed\u001b[39m | \u001b[31m0 failed\u001b[39m | 1 pending]'},
        {spinner: 'message', text: ' \u001b[36mTesting Complete\u001b[39m [\u001b[32m36 passed\u001b[39m | \u001b[31m0 failed\u001b[39m]'},
        {spinner: 'succeed'}
      ]);
      t.deepEqual(blackbox.getFiles('./sandbox/diffs'), []);
      resolve();
    });
    await blackbox.runTestophobia(tp);
  });
});

/*******************************************************************************
 *********************************  C L E A R  *********************************
 *******************************************************************************/

test.serial('Clear - particular directory', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(false, false, {input: ['sandbox/golden-screens/mobile/**/*'], flags: {clear: true}});
    const tp = blackbox.prepareTestRun([tests.test1]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {message: '\u001b[33m⚠  sandbox/golden-screens/mobile/**/* cleared.\u001b[39m', consoleLevel: 'warn', chalkColor: undefined}
    ]);
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/desktop/home'), tests.test1.goldens.desktop);
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/mobile/home'), []);
    t.deepEqual(blackbox.getFiles('./sandbox/diffs'), []);
    resolve();
  });
});

test.serial('Clear - all directories', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(false, false, {flags: {clear: true}});
    const tp = blackbox.prepareTestRun([tests.test1]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {message: '\u001b[33m⚠  Testophobia directories cleared.\u001b[39m', consoleLevel: 'warn', chalkColor: undefined}
    ]);
    t.false(fs.existsSync('./sandbox/test-screens'));
    t.false(fs.existsSync('./sandbox/diffs'));
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/desktop/home'), tests.test1.goldens.desktop);
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/mobile/home'), tests.test1.goldens.mobile);
    t.deepEqual(blackbox.getFiles('./sandbox/diffs'), []);
    resolve();
  });
});

test.serial('Clear - all directories w/ golden', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(false, false, {flags: {clear: true, golden: true}});
    const tp = blackbox.prepareTestRun([tests.test1]);
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
