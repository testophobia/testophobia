/* global require, process */
const path = require('path');
const fs = require('fs');
const sinon = require('sinon');
const {createDirectory, deleteDirectory} = require('../../lib/utils');
const {loadConfigFile} = require('../../lib/utils/load-config');
const {Testophobia} = require('../../lib/Testophobia');

const sandboxDir = path.join(__dirname, 'sandbox');

exports.setupTests = test => {
  test.beforeEach(() => {
    createDirectory(sandboxDir);
    const cfg = copyCleanConfig();
    createDirectory(cfg.goldenDirectory);
    createDirectory(cfg.testDirectory);
    createDirectory(cfg.diffDirectory);
  });

  test.afterEach.always.cb(t => {
    deleteDirectory(path.join(__dirname, 'sandbox'));
    t.end();
  });
};

exports.createTestophobia = () => {
  const tp = new Testophobia();
  tp.consoleChanges = [];
  const logger = tp.output._getLog();
  sinon.stub(logger, 'log').callsFake((message, consoleLevel, chalkColor) => {
    tp.consoleChanges.push({message, consoleLevel, chalkColor});
  });
  let isSpinning = false;
  const spinner = {
    text: '',
    isSpinning: sinon.stub().returns(isSpinning),
    start: sinon.stub().callsFake(() => {
      isSpinning = true;
      tp.consoleChanges.push({spinner: 'start'});
    }),
    stop: sinon.stub().callsFake(() => {
      isSpinning = false;
      tp.consoleChanges.push({spinner: 'stop'});
    }),
    succeed: sinon.stub().callsFake(() => {
      tp.consoleChanges.push({spinner: 'succeed'});
    }),
    fail: sinon.stub().callsFake(() => {
      tp.consoleChanges.push({spinner: 'fail'});
    })
  };
  sinon.stub(spinner, 'text').set(val => {
    tp.consoleChanges.push({spinner: 'message', text: val});
  });
  tp.output._overrideSpinner(spinner);
  return tp;
};

exports.dumpConsole = tp => {
  console.log(JSON.stringify(tp.consoleChanges, null, 2));
};

const copyCleanConfig = () => {
  fs.copyFileSync(path.join(__dirname, 'default.testophobia.config.js'), path.join(sandboxDir, 'testophobia.config.js'));
  return loadConfigFile(sandboxDir, {});
};
