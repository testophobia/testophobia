/* global require, process, exports */
'use strict';
const figures = require('figures');
const {Configuration} = require('./Configuration');
const {TestRunner} = require('./TestRunner');
const {generateConfigFile} = require('./utils/generate-config');
const {Logger} = require('./Logger');
const {Viewer} = require('./Viewer');
const fs = require('fs');
const {deleteDirectory} = require('./utils');

const log = new Logger(Logger.INFO_LEVEL);
const isWin = (process.platform === 'win32');

exports.Testophobia = class Testophobia {
  constructor(options = {}) {
    let c = new Configuration(options);
    if (c.err) log.fatal(c.err);
    this.config = c.config;
    this.target = c.target;
    this.resultsFile = c.config.diffDirectory + '/results.json';
  }

  init(testPath = false) {
    let {clear, init} = this.config;

    this._printWelcomeMessage();
    if (clear) return this._clearTestophobiaDirectories(this.cli.input[0]);
    if (init) return generateConfigFile();

    this.run(testPath);
  }

  run(testPath = false) {
    this._goldenCheck();
    let target = testPath ? testPath : this.target;
    let tr = new TestRunner(this.config, target);
    return tr.run();
  }

  _goldenCheck() {
    if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}`))
      return log.fatal(figures.cross + '  No Golden Images to Compare.');
  }

  runViewer() {
    let v = new Viewer(this.config, this.resultsFile, log);
    v.launchViewer();
  }

  _printWelcomeMessage() {
    log.info(((isWin) ? `${figures.info} ` : '😱') + ' Starting Testophobia...', 'cyan');
    log.debug('config -----------------------------------');
    Object.keys(this.config).forEach(k => {
      if (this.config[k] !== undefined && k.length > 1) log.debug(`  ${k}: ${JSON.stringify(this.config[k])}`);
    });
    log.debug('------------------------------------------');
  }

  _clearTestophobiaDirectories(path = false) {
    if (path) {
      deleteDirectory(path);
      return log.warn(`Testophobia directory ${path} cleared.`);
    }
    return Promise.all([
      deleteDirectory(this.config.goldenDirectory),
      deleteDirectory(this.config.diffDirectory),
      deleteDirectory(this.config.testDirectory)
    ]).then(() => 0).catch(() => 1);
  }

};