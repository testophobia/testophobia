/* global require, process, exports */
'use strict';
const figures = require('figures');
const {Configuration} = require('./Configuration');
const {generateConfigFile} = require('./utils/generate-config');
const fs = require('fs');
const {deleteDirectory} = require('./utils');
const {Output} = require('./Output');

const isWin = (process.platform === 'win32');

exports.Testophobia = class Testophobia {
  constructor(options = {}) {
    let {config, target} = this._initializeConfig(options);
    this.config = config;
    this.target = target;
    this.resultsFile = config.diffDirectory + '/results.json';
    this.output = new Output(this.config);
  }

  _initializeConfig(op) {
    let c = new Configuration(op);
    return c.err ? this.output.displayFailure(c.err) : c;
  }

  checkFlagsAndFiles() {
    let {clear, init} = this.config;

    this.output.printWelcomeMessage(isWin, this.config);
    if (clear) return this._clearTestophobiaDirectories(this.cli.input[0]);
    if (init) return generateConfigFile();
    this._goldenCheck();
    return 1;
  }

  _goldenCheck() {
    if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}`))
      return this.output.displayFailure(figures.cross + '  No Golden Images to Compare.');
  }

  _clearTestophobiaDirectories(path = false) {
    if (path) {
      deleteDirectory(path);
      return this.output.displayWarning(`Testophobia directory ${path} cleared.`);
    }
    return Promise.all([
      deleteDirectory(this.config.goldenDirectory),
      deleteDirectory(this.config.diffDirectory),
      deleteDirectory(this.config.testDirectory)
    ]).then(() => 0).catch(() => 1);
  }

  displayViewerMessage() {
    return this.output.displayViewerMessage(isWin, this.resultsFile);
  }

};