/* global require, process */
const test = require('ava');
const sinon = require('sinon');
const {blackbox} = require('./blackbox-utils');

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
 *********************************  T E S T S  *********************************
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
    blackbox.writeTestFiles(noActionsTest);
    const tp = blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
  });
});

test.serial('Test - bad baseUrl', t => {
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
    blackbox.writeTestFiles(noActionsTest);
    blackbox.prepareGoldens('desktop/home');
    blackbox.prepareGoldens('mobile/home');
    const tp = blackbox.createTestophobia();
    tp.config.baseUrl = 'test://o/phobia';
    await blackbox.runTestophobia(tp);
  });
});

test.serial('Test - golden not available for tests (w/ bail)', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles(noActionsTest);
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
      {spinner: 'message', text: ' \u001b[36mRunning Tests\u001b[39m [\u001b[32m0 passed\u001b[39m | \u001b[31m1 failed\u001b[39m | 1 pending]'},
      {spinner: 'fail'},
      {message: '\u001b[31m   Test Failure: \u001b[39mhome (desktop) none', consoleLevel: 'error', chalkColor: undefined}
    ]);
    resolve();
  });
});

test.serial('Test - basic test', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles(basicActionsTest);
    blackbox.prepareGoldens('desktop/home');
    blackbox.prepareGoldens('mobile/home');
    const tp = blackbox.createTestophobia();
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
    t.deepEqual(desktopFiles, [
      '2fm1HKw4gcoXhLVNxWp77htEfe9TDSbwB3wFFV4XcgDgeS7EkhYSkVxrKqLi8V.jpeg',
      '4Tc5tHFf96q46SVjWdvi5Ltby.jpeg',
      '9nLGvMUKhvYNzLezgt.jpeg',
      'GGRrZLjhLkj6f1Xpdoz4J4rpDd.jpeg',
      'M2gR52Jm6N2s55oivx7fMfGdncpVHewcDwmw5CXLkdxj4.jpeg',
      'NX2ueh6nJoM5kmkbm1mhcLkLv8gLxtn9BJ683FQGo5tp2.jpeg',
      'manifest'
    ]);
    const mobileFiles = blackbox.getFiles('./sandbox/golden-screens/mobile/home');
    t.deepEqual(mobileFiles, [
      '2fm1HKw4gcoXhLVNxWp77htEfe9TDSbwB3wFFV4XcgDgeS7EkhYSkVxrKqLi8V.jpeg',
      '3G4d3v7SFaqWUTW1AeYwB3MrST2BHmcVo8ToqwZSLPRQtjTweCr.jpeg',
      '4Tc5tHFf96q46SVjWdvi5Ltby.jpeg',
      '9nLGvMUKhvYNzLezgt.jpeg',
      'DLuoppmPYDyKPXRxRQoLdK57MC.jpeg',
      'GGRrZLjhLkj6f1Xpdoz4J4rpDd.jpeg',
      'GGRrZLjhLkj6f1Xpdoz4J4tVdH.jpeg',
      'GGRrZLjhLkj6f1Xpdoz4J6LoVy.jpeg',
      'manifest'
    ]);
    resolve();
  });
});

/*******************************************************************************
 *********************************  Test Files  ********************************
 *******************************************************************************/

const noActionsTest = [
  {
    dir: './sandbox/tests/site/home',
    file: 'home-test.js',
    contents: {
      name: 'home',
      path: '/index.html',
      actions: []
    }
  }
];

const basicActionsTest = [
  {
    dir: './sandbox/tests/site/home',
    file: 'home-test.js',
    contents: {
      name: 'home',
      path: '/index.html',
      actions: [
        {
          description: 'Scroll page to 500',
          type: 'scroll',
          target: 'html',
          scrollTop: '500'
        },
        {
          description: 'Scroll page to 1000',
          type: 'scroll',
          target: 'html',
          scrollTop: '1000'
        },
        {
          description: 'Scroll page to 1500',
          type: 'scroll',
          target: 'html',
          scrollTop: '1500',
          excludeDimensions: ['desktop']
        },
        {
          description: 'Scroll page to 2000',
          type: 'scroll',
          target: 'html',
          scrollTop: '2000',
          excludeDimensions: ['desktop']
        },
        {
          description: 'Click on the last article, confirm navigation',
          type: 'click',
          target: '.post-3 .more-link'
        },
        {
          description: 'Hover the home link - desktop res',
          type: 'hover',
          target: '.main-nav a[data-hover="Home"]',
          excludeDimensions: ['mobile'],
          delay: 600
        },
        {
          description: 'Click the home link - desktop res',
          type: 'click',
          target: '.main-nav a[data-hover="Home"]',
          excludeDimensions: ['mobile']
        },
        {
          description: 'Click the hamburger menu - mobile res',
          type: 'click',
          target: '.main-nav #trigger-overlay',
          excludeDimensions: ['desktop'],
          delay: 600
        },
        {
          description: 'Click the home link',
          type: 'click',
          target: '.overlay-hugeinc li:first-child a',
          excludeDimensions: ['desktop']
        }
      ]
    }
  }
];
