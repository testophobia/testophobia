/* global require, process */
const path = require('path');
const fs = require('fs');
const sinon = require('sinon');
const bbconfig = require('./blackbox-config');

const {createDirectory, deleteDirectory} = require('../../lib/utils');
const {Testophobia} = require('../../lib/Testophobia');
const {Output} = require('../../lib/Output');

const sandboxDir = path.join(__dirname, 'sandbox');
let consoleChanges = [];
let loggerStub = null;
let spinnerStubs = [];
let exitStub = null;

setupTests = test => {
  test.beforeEach.cb(t => {
    deleteDirectory(sandboxDir);
    t.end();
  });

  test.afterEach.always.cb(t => {
    consoleChanges = [];
    deleteDirectory(sandboxDir);
    loggerStub.restore();
    spinnerStubs.forEach(s => s.restore());
    if (exitStub) exitStub.restore();
    t.end();
  });
};

getConsoleChanges = () => {
  return consoleChanges;
};

createTestophobia = defaults => {
  const output = new Output();
  stubLogger(output);
  stubOra(output);
  return new Testophobia(defaults !== undefined ? defaults : {configFileDir: sandboxDir}, output);
};

stubLogger = output => {
  const logger = output._getLog();
  loggerStub = sinon.stub(logger, 'log').callsFake((message, consoleLevel, chalkColor) => {
    consoleChanges.push({message, consoleLevel, chalkColor});
  });
};

stubOra = output => {
  let isSpinning = false;
  let spinner = output._getSpinner();
  spinnerStubs = [];
  spinnerStubs.push(sinon.stub(spinner, 'isSpinning').returns(isSpinning));
  spinnerStubs.push(
    sinon.stub(spinner, 'start').callsFake(() => {
      isSpinning = true;
      consoleChanges.push({spinner: 'start'});
    })
  );
  spinnerStubs.push(
    sinon.stub(spinner, 'stop').callsFake(() => {
      isSpinning = false;
      consoleChanges.push({spinner: 'stop'});
    })
  );
  spinnerStubs.push(
    sinon.stub(spinner, 'succeed').callsFake(() => {
      consoleChanges.push({spinner: 'succeed'});
    })
  );
  spinnerStubs.push(
    sinon.stub(spinner, 'fail').callsFake(() => {
      consoleChanges.push({spinner: 'fail'});
    })
  );
  spinnerStubs.push(
    sinon.stub(spinner, 'text').set(val => {
      consoleChanges.push({spinner: 'message', text: val});
    })
  );
};

dumpConsole = tp => {
  console.log(JSON.stringify(consoleChanges, null, 2));
};

applyConfigFile = async (skipDirs, applyUserCfg) => {
  createDirectory(sandboxDir);
  bbconfig.setEsmResult('testophobia.config.js', {default: bbconfig.getConfig()});
  bbconfig.setUserCfgInUse(Boolean(applyUserCfg));
  if (!skipDirs) {
    createDirectory('./sandbox/diffs');
    createDirectory('./sandbox/golden-screens');
    createDirectory('./sandbox/test-screens');
  }
};

useBadConfigFile = async result => {
  createDirectory(sandboxDir);
  bbconfig.setEsmResult('testophobia.config.js', result);
};

stubFatalExit = cb => {
  exitStub = sinon.stub(process, 'exit');
  exitStub.withArgs(1).callsFake(code => cb());
};

exports.blackbox = {
  applyConfigFile: applyConfigFile,
  createTestophobia: createTestophobia,
  dumpConsole: dumpConsole,
  getConsoleChanges: getConsoleChanges,
  setupTests: setupTests,
  stubFatalExit: stubFatalExit,
  useBadConfigFile: useBadConfigFile
};
