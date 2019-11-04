/* global require, process */
const path = require('path');
const fs = require('fs');
const sinon = require('sinon');
const bbconfig = require('./blackbox-config');

const {createDirectory, copyFileOrDirectory, deleteDirectory} = require('../../lib/utils');
const {Testophobia} = require('../../lib/Testophobia');
const {Logger} = require('../../lib/Logger');
const {Output} = require('../../lib/Output');

const blackbox = {};
const sandboxDir = path.join(__dirname, 'sandbox');
let consoleChanges = [];
let loggerStub = null;
let spinnerStubs = [];
let exitStub = null;

stubLogger = (output, verbose) => {
  const logger = output._getLog();
  logger.setLevel(verbose ? Logger.DEBUG_LEVEL : Logger.INFO_LEVEL);
  loggerStub = sinon.stub(logger, 'log').callsFake((message, consoleLevel, chalkColor) => {
    if (verbose || chalkColor !== 'dim') consoleChanges.push({message, consoleLevel, chalkColor});
  });
};

stubOra = output => {
  let isSpinning = false;
  let spinner = output._getSpinner();
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
      if (exitStub) {
        exitStub.restore();
      }
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
  bbconfig.setEsmResult(path.join(__dirname, 'testophobia.config.js'), {default: bbconfig.getConfig()});
  bbconfig.setMeowResult(meowResult);
  bbconfig.setUserCfgInUse(Boolean(applyUserCfg));
  if (!skipDirs) {
    createDirectory('./sandbox/diffs');
    createDirectory('./sandbox/golden-screens');
    createDirectory('./sandbox/test-screens');
  }
};

blackbox.writeTestFiles = async tests => {
  tests.forEach(async t => {
    await createDirectory(t.dir);
    const filepath = path.join(__dirname, t.dir, t.file);
    bbconfig.setEsmResult(filepath, {default: t.contents});
    fs.writeFileSync(filepath, 'export default ' + JSON.stringify(t.contents));
  });
};

blackbox.prepareGoldens = async (goldenPath, leaveEmpty) => {
  createDirectory(`./sandbox/golden-screens/${goldenPath}`);
  if (!leaveEmpty) copyFileOrDirectory(`./files/goldens/${goldenPath}`, `./sandbox/golden-screens/${goldenPath}`);
};

blackbox.getFiles = dir => fs.readdirSync(dir);

blackbox.useBadConfigFile = async result => {
  createDirectory(sandboxDir);
  bbconfig.setEsmResult('testophobia.config.js', result);
};

blackbox.stubFatalExit = cb => {
  exitStub = sinon.stub(process, 'exit');
  exitStub.withArgs(1).callsFake(code => {
    cb();
    return true;
  });
};

exports.blackbox = blackbox;