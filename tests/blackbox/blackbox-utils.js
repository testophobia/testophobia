/* global require, process */
const path = require('path');
const fs = require('fs');
const sinon = require('sinon');
const bbconfig = require('./blackbox-config');

const {createDirectory, copyFileOrDirectory, deleteDirectory} = require('../../lib/utils/file/file');
const {Testophobia} = require('../../lib/Testophobia');
const {Logger} = require('../../lib/Logger');
const {Output} = require('../../lib/Output');

const blackbox = {};
const sandboxDir = path.join(__dirname, 'sandbox');
let consoleChanges = [];
let loggerStub = null;
let spinnerStubs = [];
let exitStub = null;
let parallelStub = null;

stubLogger = (output, verbose) => {
  const logger = output._getLog();
  logger.setLevel(verbose ? Logger.DEBUG_LEVEL : Logger.INFO_LEVEL);
  loggerStub = sinon.stub(logger, '_log').callsFake((message, consoleLevel, chalkColor) => {
    if (verbose || chalkColor !== 'dim') consoleChanges.push({message, consoleLevel, chalkColor});
    if (consoleLevel === 'error') console.error(message);
  });
};

stubOra = output => {
  let isSpinning = false;
  let spinner = new SpinnerMock();
  spinnerStubs = [];
  spinnerStubs.push(sinon.stub(spinner, 'isSpinning').returns(isSpinning));
  spinnerStubs.push(
    sinon.stub(spinner, 'start').callsFake(() => {
      if (!isSpinning) consoleChanges.push({spinner: 'start'});
      isSpinning = true;
    })
  );
  spinnerStubs.push(sinon.stub(spinner, 'stop').callsFake(() => {}));
  spinnerStubs.push(
    sinon.stub(spinner, 'succeed').callsFake(() => {
      consoleChanges.push({spinner: 'succeed'});
      isSpinning = false;
    })
  );
  spinnerStubs.push(
    sinon.stub(spinner, 'fail').callsFake(() => {
      consoleChanges.push({spinner: 'fail'});
      isSpinning = false;
    })
  );
  spinnerStubs.push(
    sinon.stub(spinner, 'text').set(val => {
      consoleChanges.push({spinner: 'message', text: val});
    })
  );
  output._setSpinner(spinner);
};

blackbox.setupTests = test => {
  test.beforeEach(t => {
    return new Promise(async resolve => {
      await deleteDirectory(sandboxDir);
      resolve();
    });
  });

  test.afterEach.always(t => {
    return new Promise(async resolve => {
      consoleChanges = [];
      //await deleteDirectory(sandboxDir);
      loggerStub.restore();
      spinnerStubs.forEach(s => s.restore());
      if (exitStub) exitStub.restore();
      if (parallelStub) parallelStub.restore();
      resolve();
    });
  });
};

blackbox.getConsoleChanges = () => {
  return consoleChanges;
};

blackbox.createTestophobia = verbose => {
  const output = new Output();
  stubLogger(output, verbose);
  stubOra(output);
  return new Testophobia(sandboxDir, output);
};

blackbox.runTestophobia = async tp => {
  try {
    await tp.run();
  } catch (e) {
    /* ignored */
  }
};

blackbox.dumpConsole = tp => {
  console.log(JSON.stringify(consoleChanges, null, 2));
};

blackbox.applyConfigFile = async (skipDirs, applyUserCfg, meowResult) => {
  createDirectory(sandboxDir);
  bbconfig.setEsmResult(path.join(__dirname, 'sandbox/testophobia.config.js'), {default: bbconfig.getConfig()});
  bbconfig.setMeowResult(meowResult);
  bbconfig.setUserCfgInUse(Boolean(applyUserCfg));
  if (!skipDirs) {
    createDirectory('./sandbox/diffs');
    createDirectory('./sandbox/golden-screens');
    createDirectory('./sandbox/test-screens');
  }
};

blackbox.prepareTestRun = tests => {
  blackbox.writeTestFiles(tests);
  blackbox.prepareGoldens(tests);
  return blackbox.createTestophobia();
};

blackbox.writeTestFiles = async tests => {
  tests.forEach(async t => {
    await createDirectory(t.dir);
    const filepath = path.join(__dirname, t.dir, t.file);
    bbconfig.setEsmResult(filepath, {default: t.contents});
    fs.writeFileSync(filepath, 'export default ' + JSON.stringify(t.contents));
  });
};

blackbox.prepareGoldens = async tests => {
  createDirectory(`./sandbox/golden-screens/chromium/desktop/section1`);
  createDirectory(`./sandbox/golden-screens/chromium/mobile/section1`);
  createDirectory(`./sandbox/golden-screens/chromium/desktop/section2`);
  createDirectory(`./sandbox/golden-screens/chromium/mobile/section2`);
  createDirectory(`./sandbox/golden-screens/chromium/desktop/section3`);
  createDirectory(`./sandbox/golden-screens/chromium/mobile/section3`);
  if (tests && tests.length) {
    tests.forEach(t => {
      copyFileOrDirectory(`./files/goldens/${t.testName}`, `./sandbox/golden-screens/chromium`);
    });
  }
};

blackbox.getFiles = dir => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(p => !p.startsWith('.'));
};

blackbox.useBadConfigFile = async result => {
  createDirectory(sandboxDir);
  bbconfig.setEsmResult('testophobia.config.js', result);
  bbconfig.setMeowResult({input: ['undefined'], flags: {}});
};

blackbox.stubFatalExit = cb => {
  exitStub = sinon.stub(process, 'exit');
  exitStub.withArgs(1).callsFake(code => {
    cb();
    return true;
  });
};

blackbox.stubParallel = (tp, cb) => {
  parallelStub = sinon.stub(tp, '_parallelRunComplete');
  parallelStub.callsFake(() => cb());
};

blackbox.setFileGenResult = (result, cb) => {
  bbconfig.setInquirerResult(result, cb);
};

blackbox.getGenConfigContents = () => {
  return bbconfig.getGenConfig();
};

blackbox.getGenTestContents = () => {
  return bbconfig.getGenTest();
};

class SpinnerMock {
  fail() {}
  get isSpinning() {}
  start() {}
  stop() {}
  succeed() {}
  set text(t) {}
}

module.exports = blackbox;
