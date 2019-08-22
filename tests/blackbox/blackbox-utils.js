/* global require, process */
const path = require('path');
const fs = require('fs');
const sinon = require('sinon');
const {createDirectory, deleteDirectory} = require('../../lib/utils');
const {loadConfigFile} = require('../../lib/utils/load-config');
const {Testophobia} = require('../../lib/Testophobia');
const {Output} = require('../../lib/Output');

const sandboxDir = path.join(__dirname, 'sandbox');
let consoleChanges = [];
let loggerStub = null;
let exitStub = null;

setupTests = test => {
  test.afterEach.always.cb(t => {
    consoleChanges = [];
    deleteDirectory(sandboxDir);
    loggerStub.restore();
    if (exitStub) exitStub.restore();
    t.end();
  });
};

getConsoleChanges = () => {
  return consoleChanges;
};

createTestophobia = () => {
  const output = new Output();
  const logger = output._getLog();
  loggerStub = sinon.stub(logger, 'log').callsFake((message, consoleLevel, chalkColor) => {
    consoleChanges.push({message, consoleLevel, chalkColor});
  });
  let isSpinning = false;
  const spinner = {
    text: '',
    isSpinning: sinon.stub().returns(isSpinning),
    start: sinon.stub().callsFake(() => {
      isSpinning = true;
      consoleChanges.push({spinner: 'start'});
    }),
    stop: sinon.stub().callsFake(() => {
      isSpinning = false;
      consoleChanges.push({spinner: 'stop'});
    }),
    succeed: sinon.stub().callsFake(() => {
      consoleChanges.push({spinner: 'succeed'});
    }),
    fail: sinon.stub().callsFake(() => {
      consoleChanges.push({spinner: 'fail'});
    })
  };
  sinon.stub(spinner, 'text').set(val => {
    consoleChanges.push({spinner: 'message', text: val});
  });
  output._overrideSpinner(spinner);
  return new Testophobia({configFileDir: sandboxDir}, output);
};

dumpConsole = tp => {
  console.log(JSON.stringify(consoleChanges, null, 2));
};

applyConfigFile = async (manipulateFn, skipDirs) => {
  createDirectory(sandboxDir);
  const cfg = await loadConfigFile(__dirname, 'default.testophobia.config.js', {});
  if (manipulateFn) manipulateFn(cfg);
  const contents = `export default ${JSON.stringify(cfg, null, 2)};`;
  await fs.writeFileSync(path.join(sandboxDir, 'testophobia.config.js'), contents, err => {
    if (err) throw err;
  });
  if (!skipDirs) {
    if (cfg.goldenDirectory) createDirectory(cfg.goldenDirectory);
    if (cfg.testDirectory) createDirectory(cfg.testDirectory);
    if (cfg.diffDirectory) createDirectory(cfg.diffDirectory);
  }
  return cfg;
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
  stubFatalExit: stubFatalExit
};
