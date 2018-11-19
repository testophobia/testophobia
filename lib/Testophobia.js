/* global require, global, process, exports */
'use strict';
const figures = require('figures');
const {Configuration} = require('./Configuration');
const {TestRunner} = require('./TestRunner');
const {generateConfigFile} = require('./utils/generate-config');
const {Logger} = require('./Logger');
const fs = require('fs');
const {deleteDirectory} = require('./utils');

global.response = 0;

const log = new Logger(Logger.INFO_LEVEL);
const isWin = (process.platform === 'win32');

exports.Testophobia = class Testophobia {
  constructor(config = {}) {
    this.cf = new Configuration(config);
    this.config = this.cf.config;
  }

  init(testPath = false) {
    this._printWelcomeMessage();
    if (this.config.clear) return this._clearTestophobiaDirectories(this.cli.input[0]);
    if (this.config.init) return generateConfigFile();

    this.run(testPath);
  }

  async run(testPath = false) {
    this.target = testPath ? testPath : this.cf.target;

    if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}`))
      return log.fatal(figures.cross + '  No Golden Images to Compare.');

    let tr = new TestRunner(this.config, this.target);
    let r = await tr.run();
    return r;
  }

  configure() {
    return this.cf.configure();
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