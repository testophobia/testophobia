import fs from 'fs';
import test from 'ava';
import blackbox from './blackbox-utils.js';
import tests from './files/tests/index.js';
import {createDirectory, copyFileOrDirectory} from '../../lib/utils/file/file.js';

blackbox.setupTests(test);

/*******************************************************************************
 *******************************  C O N F I G S  *******************************
 *******************************************************************************/

test.serial('Config - no config file', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.useBadConfigFile();
    try {
      const tp = await blackbox.createTestophobia();
    } catch (e) {
      t.true(e.message === 'Process Exited');
      t.deepEqual(consoleChanges, [{spinner: 'fail'}, {message: '✘  Error loading testophobia config file', consoleLevel: 'error', chalkColor: 'red'}]);
      resolve();
    }
  })
});

test.serial('Config - unparseable config file', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.useBadConfigFile('bad config file');
    try {
      const tp = await blackbox.createTestophobia();
    } catch (e) {
      t.true(e.message === 'Process Exited');
      t.deepEqual(consoleChanges, [{spinner: 'fail'}, {message: '✘  Error loading testophobia config file', consoleLevel: 'error', chalkColor: 'red'}]);
      resolve();
    }
  });
});

test.serial('Config - bad config file (noexport)', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    blackbox.useBadConfigFile('{}');
    try {
      const tp = await blackbox.createTestophobia();
    } catch (e) {
      t.true(e.message === 'Process Exited');
      t.deepEqual(consoleChanges, [{spinner: 'fail'}, {message: '✘  Error loading testophobia config file', consoleLevel: 'error', chalkColor: 'red'}]);
      resolve();
    }
  });
});

test.serial('Config - user config overrides', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(true, true);
    const tp = await blackbox.createTestophobia(true);
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
    const tp = await blackbox.createTestophobia(true);
    t.true(consoleChanges.some(c => c.message === '  tests: "cfg/path/to/tests"'));
    resolve();
  });
});

test.serial('Config - No golden dir', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(true);
    const tp = await blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'fail'},
      {message: '✘  No Golden Images to Compare.', consoleLevel: 'error', chalkColor: 'red'}
    ]);
    resolve();
  });
});

test.serial('Config - no test files exist', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    const tp = await blackbox.createTestophobia();
    tp.config.tests = undefined;
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'fail'},
      {message: '✘  No test files found! Check your config or input path.', consoleLevel: 'error', chalkColor: 'red'}
    ]);
    resolve();
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
    const tp = await blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [0 done | 2 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [1 done | 1 pending]'},
      {spinner: 'message', text: ' Generation Complete (chromium) [2 done]'},
      {spinner: 'succeed'}
    ]);
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/chromium/desktop/section1'), blackbox.getFiles('./files/goldens/test1/desktop/section1'));
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/chromium/mobile/section1'), blackbox.getFiles('./files/goldens/test1/mobile/section1'));
    t.deepEqual(blackbox.getFiles('./sandbox/diffs/chromium'), []);
    resolve();
  });
});

test.serial('Golden - with actions', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(false, false, {flags: {golden: true}});
    blackbox.writeTestFiles([tests.test2]);
    const tp = await blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [0 done | 20 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [1 done | 19 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [2 done | 18 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [3 done | 17 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [4 done | 16 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [5 done | 15 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [6 done | 14 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [7 done | 13 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [8 done | 12 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [9 done | 11 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [10 done | 10 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [11 done | 9 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [12 done | 8 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [13 done | 7 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [14 done | 6 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [15 done | 5 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [16 done | 4 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [17 done | 3 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [18 done | 2 pending]'},
      {spinner: 'message', text: ' Generating Goldens (chromium) [19 done | 1 pending]'},
      {spinner: 'message', text: ' Generation Complete (chromium) [20 done]'},
      {spinner: 'succeed'}
    ]);
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/chromium/desktop/section1'), blackbox.getFiles('./files/goldens/test2/desktop/section1'));
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/chromium/mobile/section1'), blackbox.getFiles('./files/goldens/test2/mobile/section1'));
    t.deepEqual(blackbox.getFiles('./sandbox/diffs/chromium'), []);
    resolve();
  });
});

/*******************************************************************************
 ***********************  B A D   T E S T   C O N F I G  ***********************
 *******************************************************************************/

test.serial('Bad Test - no goldens directory found', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles([tests.test1]);
    const tp = await blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'fail'},
      {message: '✘  Missing Golden Images: ./sandbox/golden-screens/chromium/desktop/section1', consoleLevel: 'error', chalkColor: 'red'}
    ]);
    resolve();
  });
});

test.serial('Bad Test - bad baseUrl (slashes)', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    const tp = await blackbox.prepareTestRun([tests.test1]);
    tp.config.baseUrl = 'test://o/phobia';
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' Running Tests (chromium) [0 passed | 0 failed | 2 pending]'},
      {spinner: 'fail'},
      {
        message: '✘  Error: baseUrl should only contain a domain name, but a path was supplied. Handle all pathing in test files.',
        consoleLevel: 'error',
        chalkColor: 'red'
      }
    ]);
    resolve();
  });
});

test.serial('Bad Test - bad baseUrl (hash)', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    const tp = await blackbox.prepareTestRun([tests.test1]);
    tp.config.baseUrl = 'test://o.phobia#foo';
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' Running Tests (chromium) [0 passed | 0 failed | 2 pending]'},
      {spinner: 'fail'},
      {
        message: '✘  Error: baseUrl should only contain a domain name, but a path was supplied. Handle all pathing in test files.',
        consoleLevel: 'error',
        chalkColor: 'red'
      }
    ]);
    resolve();
  });
});

test.serial('Bad Test - unreachable url', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    const testConfig = [tests.test1][0];
    delete testConfig.contents.path;
    const tp = await blackbox.prepareTestRun([testConfig]);
    tp.config.baseUrl = 'test://o.phobia';
    tp.config.tests = [`sandbox/tests/site/section1/section1-${global.mocks.instance }-test.js`];
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' Running Tests (chromium) [0 passed | 0 failed | 2 pending]'},
      {spinner: 'fail'},
      {
        message: '✘  baseUrl supplied cannot be reached: test://o.phobia\npage.goto: net::ERR_ABORTED at test://o.phobia\n=========================== logs ===========================\nnavigating to "test://o.phobia", waiting until "networkidle"\n============================================================',
        consoleLevel: 'error',
        chalkColor: 'red'
      }
    ]);
    resolve();
  });
});

test.serial('Bad Test - golden not available (w/ bail)', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles([tests.test1]);
    blackbox.prepareGoldens(null);
    const tp = await blackbox.createTestophobia();
    tp.config.bail = true;
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' Running Tests (chromium) [0 passed | 0 failed | 2 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [0 passed | 1 failed | 1 pending]'},
      {spinner: 'message', text: ' Bailed (chromium) [0 passed | 1 failed | 1 pending]'},
      {spinner: 'fail'},
      {message: '   Test Failure: section1 (desktop) none', consoleLevel: 'error', chalkColor: undefined}
    ]);
    resolve();
  });
});

test.serial('Bad Test - duplicate action descriptions', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles([tests.test6]);
    blackbox.prepareGoldens(null);
    createDirectory(`./sandbox/golden-screens/chromium/tablet/section1`);
    const tp = await blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'fail'},
      {message: '✘  Duplicate action description: Click the test button', consoleLevel: 'error', chalkColor: 'red'}
    ]);
    resolve();
  });
});

/*******************************************************************************
 *********************************  T E S T S  *********************************
 *******************************************************************************/

test.serial('Test - section 1 - no actions - junit output', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    const tp = await blackbox.prepareTestRun([tests.test1]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' Running Tests (chromium) [0 passed | 0 failed | 2 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [1 passed | 0 failed | 1 pending]'},
      {spinner: 'message', text: ' Testing Complete (chromium) [2 passed | 0 failed]'},
      {spinner: 'succeed'}
    ]);
    t.deepEqual(blackbox.getFiles('./sandbox/diffs/chromium'), []);
    resolve();
  });
});

test.serial('Test - section 1 - no actions - failure', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(false, false, {flags: {writeXml: true}});
    blackbox.writeTestFiles([tests.test1]);
    copyFileOrDirectory(`./files/goldens/test1/failure/desktop`, `./sandbox/golden-screens/chromium/desktop/section1`);
    copyFileOrDirectory(`./files/goldens/test1/failure/mobile`, `./sandbox/golden-screens/chromium/mobile/section1`);
    const tp = await blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' Running Tests (chromium) [0 passed | 0 failed | 2 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [0 passed | 1 failed | 1 pending]'},
      {spinner: 'message', text: ' Testing Complete (chromium) [0 passed | 2 failed]'},
      {spinner: 'succeed'},
      {message: '   Test Failure: section1 (desktop) none', consoleLevel: 'error', chalkColor: undefined},
      {message: '   Test Failure: section1 (mobile) none', consoleLevel: 'error', chalkColor: undefined}
    ]);
    const files = blackbox.getFiles('./sandbox/diffs/chromium');
    t.true(files.includes('results.json'));
    t.true(files.some(f => f.startsWith('section1-desktop--')));
    t.true(files.some(f => f.startsWith('section1-mobile--')));
    t.true(files.includes('junit.xml'));
    t.is(
      fs.readFileSync('./sandbox/diffs/chromium/junit.xml').toString(),
      '<?xml version="1.0" encoding="UTF-8"?><testsuites><testsuite name="section1-desktop" time="0" tests="1" skipped="0" failures="1"><testcase className="section1-desktop-0" name="Initial Snapshot" time="0"><failure message="Not a match!">Screenshot Failure</failure></testcase></testsuite><testsuite name="section1-mobile" time="0" tests="1" skipped="0" failures="1"><testcase className="section1-mobile-0" name="Initial Snapshot" time="0"><failure message="Not a match!">Screenshot Failure</failure></testcase></testsuite></testsuites>'
    );
    resolve();
  });
});

test.serial('Test - section 1', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    const tp = await blackbox.prepareTestRun([tests.test2]);
    tp.config.pageLoadMax = 5000;
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' Running Tests (chromium) [0 passed | 0 failed | 20 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [1 passed | 0 failed | 19 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [2 passed | 0 failed | 18 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [3 passed | 0 failed | 17 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [4 passed | 0 failed | 16 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [5 passed | 0 failed | 15 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [6 passed | 0 failed | 14 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [7 passed | 0 failed | 13 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [8 passed | 0 failed | 12 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [9 passed | 0 failed | 11 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [10 passed | 0 failed | 10 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [11 passed | 0 failed | 9 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [12 passed | 0 failed | 8 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [13 passed | 0 failed | 7 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [14 passed | 0 failed | 6 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [15 passed | 0 failed | 5 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [16 passed | 0 failed | 4 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [17 passed | 0 failed | 3 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [18 passed | 0 failed | 2 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [19 passed | 0 failed | 1 pending]'},
      {spinner: 'message', text: ' Testing Complete (chromium) [20 passed | 0 failed]'},
      {spinner: 'succeed'}
    ]);
    t.deepEqual(blackbox.getFiles('./sandbox/diffs/chromium'), []);
    resolve();
  });
});

test.serial('Test - section 1 - clip regions, scale, exclude, and png', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles([tests.test3]);
    const tp = await blackbox.prepareTestRun([tests.test3]);
    tp.config.fileType = 'png';
    tp.config.clipRegions = [{type: 'desktop', width: 1024, height: 768}];
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' Running Tests (chromium) [0 passed | 0 failed | 3 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [1 passed | 0 failed | 2 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [2 passed | 0 failed | 1 pending]'},
      {spinner: 'message', text: ' Testing Complete (chromium) [3 passed | 0 failed]'},
      {spinner: 'succeed'}
    ]);
    t.deepEqual(blackbox.getFiles('./sandbox/diffs/chromium'), []);
    resolve();
  });
});

test.serial('Test - section 2', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles([tests.test5]);
    copyFileOrDirectory(`./files/files/testfile.json`, `./sandbox/files/testfile.json`);
    const tp = await blackbox.prepareTestRun([tests.test5]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' Running Tests (chromium) [0 passed | 0 failed | 6 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [1 passed | 0 failed | 5 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [2 passed | 0 failed | 4 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [3 passed | 0 failed | 3 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [4 passed | 0 failed | 2 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [5 passed | 0 failed | 1 pending]'},
      {spinner: 'message', text: ' Testing Complete (chromium) [6 passed | 0 failed]'},
      {spinner: 'succeed'}
    ]);
    t.deepEqual(blackbox.getFiles('./sandbox/diffs/chromium'), []);
    resolve();
  });
});

test.serial('Test - section 3', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(false, false, {flags: {writeXml: true}});
    blackbox.writeTestFiles([tests.test4]);
    const tp = await blackbox.prepareTestRun([tests.test4]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {spinner: 'start'},
      {spinner: 'message', text: ' Running Tests (chromium) [0 passed | 0 failed | 4 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [1 passed | 0 failed | 3 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [2 passed | 0 failed | 2 pending]'},
      {spinner: 'message', text: ' Running Tests (chromium) [3 passed | 0 failed | 1 pending]'},
      {spinner: 'message', text: ' Testing Complete (chromium) [4 passed | 0 failed]'},
      {spinner: 'succeed'}
    ]);
    t.deepEqual(blackbox.getFiles('./sandbox/diffs/chromium'), ['junit.xml']);
    t.is(
      fs.readFileSync('./sandbox/diffs/chromium/junit.xml').toString(),
      '<?xml version="1.0" encoding="UTF-8"?><testsuites><testsuite name="section3-desktop" time="0" tests="2" skipped="0" failures="0"><testcase className="section3-desktop-0" name="Initial Snapshot" time="0"></testcase><testcase className="section3-desktop-1" name="Scroll the div to 500" time="0"></testcase></testsuite><testsuite name="section3-mobile" time="0" tests="2" skipped="0" failures="0"><testcase className="section3-mobile-0" name="Initial Snapshot" time="0"></testcase><testcase className="section3-mobile-1" name="Scroll the div to 500" time="0"></testcase></testsuite></testsuites>'
    );
    resolve();
  });
});

test.serial('Test - parallel section1 and section3', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile();
    blackbox.writeTestFiles([tests.test2, tests.test4]);
    const tp = await blackbox.prepareTestRun([tests.test2, tests.test4]);
    tp.config.maxParallel = 2;
    blackbox.stubParallel(tp, () => {
      t.deepEqual(consoleChanges, [
        {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
        {spinner: 'start'},
        {spinner: 'message', text: ' Running Tests (chromium) [0 passed | 0 failed | 24 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [1 passed | 0 failed | 23 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [2 passed | 0 failed | 22 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [3 passed | 0 failed | 21 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [4 passed | 0 failed | 20 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [5 passed | 0 failed | 19 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [6 passed | 0 failed | 18 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [7 passed | 0 failed | 17 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [8 passed | 0 failed | 16 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [9 passed | 0 failed | 15 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [10 passed | 0 failed | 14 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [11 passed | 0 failed | 13 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [12 passed | 0 failed | 12 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [13 passed | 0 failed | 11 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [14 passed | 0 failed | 10 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [15 passed | 0 failed | 9 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [16 passed | 0 failed | 8 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [17 passed | 0 failed | 7 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [18 passed | 0 failed | 6 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [19 passed | 0 failed | 5 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [20 passed | 0 failed | 4 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [21 passed | 0 failed | 3 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [22 passed | 0 failed | 2 pending]'},
        {spinner: 'message', text: ' Running Tests (chromium) [23 passed | 0 failed | 1 pending]'},
        {spinner: 'message', text: ' Testing Complete (chromium) [24 passed | 0 failed]'},
        {spinner: 'succeed'}
      ]);
      t.deepEqual(blackbox.getFiles('./sandbox/diffs/chromium'), []);
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
    await blackbox.applyConfigFile(false, false, {input: ['sandbox/golden-screens/chromium/mobile/**/*'], flags: {clear: true}});
    const tp = await blackbox.prepareTestRun([tests.test1]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {message: '⚠  sandbox/golden-screens/chromium/mobile/**/* cleared.', consoleLevel: 'warn', chalkColor: undefined}
    ]);
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/chromium/desktop/section1'), blackbox.getFiles('./files/goldens/test1/desktop/section1'));
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/chromium/mobile/section1'), []);
    t.deepEqual(blackbox.getFiles('./sandbox/diffs/chromium'), []);
    resolve();
  });
});

test.serial('Clear - all directories', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(false, false, {flags: {clear: true}});
    const tp = await blackbox.prepareTestRun([tests.test1]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {message: '⚠  Testophobia directories cleared.', consoleLevel: 'warn', chalkColor: undefined}
    ]);
    t.false(fs.existsSync('./sandbox/test-screens'));
    t.false(fs.existsSync('./sandbox/diffs'));
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/chromium/desktop/section1'), blackbox.getFiles('./files/goldens/test1/desktop/section1'));
    t.deepEqual(blackbox.getFiles('./sandbox/golden-screens/chromium/mobile/section1'), blackbox.getFiles('./files/goldens/test1/mobile/section1'));
    t.deepEqual(blackbox.getFiles('./sandbox/diffs/chromium'), []);
    resolve();
  });
});

test.serial('Clear - all directories w/ golden', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.applyConfigFile(false, false, {flags: {clear: true, golden: true}});
    const tp = await blackbox.prepareTestRun([tests.test1]);
    await blackbox.runTestophobia(tp);
    t.deepEqual(consoleChanges, [
      {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
      {message: '⚠  Testophobia directories cleared.', consoleLevel: 'warn', chalkColor: undefined}
    ]);
    t.false(fs.existsSync('./sandbox/test-screens'));
    t.false(fs.existsSync('./sandbox/diffs'));
    t.false(fs.existsSync('./sandbox/golden-screens'));
    resolve();
  });
});

/*******************************************************************************
 *****************************  G E N   F I L E S  *****************************
 *******************************************************************************/

test.serial('Gen File - testophobia.config.js - already exists', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.createEmptySandbox({flags: {init: true}});
    fs.writeFileSync('./sandbox/testophobia.config.js', 'export default {}');
    blackbox.setFileGenResult(
      {
        genFile: 'config'
      },
      () => {
        t.deepEqual(consoleChanges, [
          {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
          {
            message: 'testophobia.config.js already exists!',
            consoleLevel: 'info',
            chalkColor: undefined
          }
        ]);
        resolve();
      }
    );
    const tp = await blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
  });
});

test.serial('Gen File - testophobia.config.js', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.createEmptySandbox({flags: {init: true}});
    blackbox.setFileGenResult(
      {
        genFile: 'config',
        fileType: 'jpeg',
        baseUrl: 'http://test.o.phobia',
        testGlob: 'foo/bar/baz*'
      },
      () => {
        t.deepEqual(consoleChanges, [
          {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
          {
            message: 'testophobia.config.js created.',
            consoleLevel: 'info',
            chalkColor: undefined
          }
        ]);
        t.deepEqual(JSON.parse(fs.readFileSync('./sandbox/testophobia.config.js').toString().slice(15, -1)), blackbox.getGenConfigContents());
        resolve();
      }
    );
    const tp = await blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
  });
});

test.serial('Gen File - test file - already exists', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.createEmptySandbox({flags: {init: true}});
    fs.writeFileSync('./sandbox/generated-test.js', 'export default {}');
    blackbox.setFileGenResult(
      {
        genFile: 'test',
        testLoc: 'generated-test.js'
      },
      () => {
        t.deepEqual(consoleChanges, [
          {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
          {
            message: 'test file already exists!',
            consoleLevel: 'info',
            chalkColor: undefined
          }
        ]);
        resolve();
      }
    );
    const tp = await blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
  });
});

test.serial('Gen File - test file', t => {
  return new Promise(async resolve => {
    const consoleChanges = blackbox.getConsoleChanges();
    await blackbox.createEmptySandbox({flags: {init: true}});
    blackbox.setFileGenResult(
      {
        genFile: 'test',
        testLoc: 'generated-test.js',
        testName: 'Generated Test',
        testPath: '/some/generated/test'
      },
      () => {
        t.deepEqual(consoleChanges, [
          {message: '😱 Starting Testophobia...', consoleLevel: 'info', chalkColor: 'cyan'},
          {
            message: 'generated-test.js created.',
            consoleLevel: 'info',
            chalkColor: undefined
          }
        ]);
        t.deepEqual(JSON.parse(fs.readFileSync('./sandbox/generated-test.js').toString().slice(15, -1)), blackbox.getGenTestContents());
        resolve();
      }
    );
    const tp = await blackbox.createTestophobia();
    await blackbox.runTestophobia(tp);
  });
});
