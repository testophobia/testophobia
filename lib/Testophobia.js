/* global require, process, exports */
'use strict';
const figures = require('figures');
const {Configuration} = require('./Configuration');
const {generateConfigFile} = require('./utils/generate-config');
const {Logger} = require('./Logger');
const fs = require('fs');
const {deleteDirectory} = require('./utils');

const isWin = (process.platform === 'win32');

exports.Testophobia = class Testophobia {
  constructor(options = {}) {
    let {config, target} = this._initializeConfig(options);
    this.config = config;
    this.target = target;
    this.resultsFile = config.diffDirectory + '/results.json';
    this.log = new Logger(Logger.INFO_LEVEL);
  }

  _initializeConfig(op) {
    let c = new Configuration(op);
    return c.err ? this.log.fatal(c.err) : c;
  }

  _checkFlagsAndFiles() {
    let {clear, init} = this.config;

    this._printWelcomeMessage();
    if (clear) return this._clearTestophobiaDirectories(this.cli.input[0]);
    if (init) return generateConfigFile();
    this._goldenCheck();
    return 1;
  }

  _goldenCheck() {
    if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}`))
      return this.log.fatal(figures.cross + '  No Golden Images to Compare.');
  }

  _printWelcomeMessage() {
    this.log.info(((isWin) ? `${figures.info} ` : '😱') + ' Starting Testophobia...', 'cyan');
    this.log.debug('config -----------------------------------');
    Object.keys(this.config).forEach(k => {
      if (this.config[k] !== undefined && k.length > 1) this.log.debug(`  ${k}: ${JSON.stringify(this.config[k])}`);
    });
    this.log.debug('------------------------------------------');
  }

  _clearTestophobiaDirectories(path = false) {
    if (path) {
      deleteDirectory(path);
      return this.log.warn(`Testophobia directory ${path} cleared.`);
    }
    return Promise.all([
      deleteDirectory(this.config.goldenDirectory),
      deleteDirectory(this.config.diffDirectory),
      deleteDirectory(this.config.testDirectory)
    ]).then(() => 0).catch(() => 1);
  }

};