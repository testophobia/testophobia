/* global exports, require, process */
'use strict';
const {Logger} = require('./Logger');
const figures = require('figures');
const {ScreenGenerator} = require('./ScreenGenerator');
const {generateResultFile} = require('./utils/generate-result-file');
const {formatTests} = require('./utils/format-tests');
const {serveViewer} = require('./utils/serve-viewer');

const log = new Logger(Logger.INFO_LEVEL);
const isWin = (process.platform === 'win32');

exports.TestRunner = class TestRunner {
  constructor(config, target) {
    this.config = config;
    this.target = target;
  }

  async run() {
    let response = 0;
    let tests = await formatTests(this.config, this.target);
    if (!tests) this._throwFileError();
    let results = await this._executeTests(tests);
    if (!this.config.golden && results && results.failures.length) {
      this._handleFailures(results);
      return response = 1;
    }
    return response;
  }

  _executeTests(tests) {
    const sg = new ScreenGenerator(this.config, tests);
    return sg.run();
  }

  _throwFileError() {
    return log.fatal('No test files found! Check your config or input path.');
  }

  async _handleFailures(resp) {
    let file = await generateResultFile(this.config, resp);
    if (!file) log.error('There was an error adding info to the JSON file', 'red');
    log.displayErrorDetails(resp.failures);
    if (!this.config.skipViewer) this.launchViewer();
  }

  launchViewer() {
    const resultsFilePath = this.config.diffDirectory + "/results.json";
    log.info(((isWin) ? `${figures.info} ` : '🔍') + ' Testophobia Viewer served on port 8090', 'cyan');
    log.debug(` - using results file: ${resultsFilePath}`);
    serveViewer(this.config, resultsFilePath);
  }

};