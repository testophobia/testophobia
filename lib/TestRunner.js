/* global exports, require, process, global, module */
'use strict';
const {Logger} = require('./Logger');
const chalk = require('chalk');
const figures = require('figures');
const {ScreenGenerator} = require('./ScreenGenerator');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const esm = require('esm');
const {asyncForEach} = require('./utils');
const {serveViewer} = require('./utils/serve-viewer');

const log = new Logger(Logger.INFO_LEVEL);
const isWin = (process.platform === 'win32');

exports.TestRunner = class TestRunner {
  constructor(config, target) {
    this.config = config;
    this.target = target;
  }

  async run() {
    if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}`))
      return log.fatal(figures.cross + '  No Golden Images to Compare.');

    let resp = await this._handleTestPaths(this.target, this.config.golden);
    if (!this.config.golden && resp && resp.failures.length) this._handleFailures(resp);
    return global.response;
  }

  async _handleTestPaths(target, isGolden) {
    if (typeof(target) === 'undefined') return this._throwFileError();
    if (typeof target === 'object' && target.filter(t => Object.keys(t).includes('name')).length) return this._executeTests(isGolden, this.config.tests);
    let testPaths = [];
    typeof target === 'string' ? testPaths = await glob.sync(target) : await asyncForEach(target, async t => {
      let tp = await glob.sync(t);
      tp.forEach(t => testPaths.push(t));
    });
    if (!testPaths.length) {
      testPaths = await this.config.tests && Array.isArray(this.config.tests) ? this.config.tests.filter(t => t.name && t.name === target) : [];
      return testPaths.length ? this._executeTests(isGolden, testPaths) : this._throwFileError();
    }
    return this._populateAndRunTests(testPaths, isGolden);
  }

  async _populateAndRunTests(testPaths, goldenTest) {
    let tests = [];
    await asyncForEach(testPaths, t => {
      let file = esm(module, {
        cjs: false,
        force: true,
        mode: 'all'
      })(path.join(process.cwd(), t));
      if (file.default) tests.push(file.default);
    });
    return tests.length ? this._executeTests(goldenTest, tests) : this._throwFileError();
  }

  async _executeTests(goldenTest, tests) {
    const sg = new ScreenGenerator(this.config, goldenTest, tests);
    let resp = await sg.run();
    return resp;
  }

  _throwFileError() {
    return log.fatal('No test files found! Check your config or input path.');
  }

  async _handleFailures(resp) {
    await this._createResultFile(resp);
    this._displayErrorDetails(resp.failures);
    if (!this.config.skipViewer) this.launchViewer();
  }

  _createResultFile({tests, failures}) {
    this.resultFile = (this.config.diffDirectory) + '/results.json';
    fs.createWriteStream(this.resultFile);
    this.results = {
      tests: tests,
      date: Date.now(),
      fileType: this.config.fileType,
      quality: (this.config.fileType === 'png') ? 'n/a' : this.config.quality,
      threshold: this.config.threshold,
      baseUrl: this.config.baseUrl,
      screenTypes: this.config.dimensions,
      failures: failures
    };
    fs.appendFileSync(this.resultFile, JSON.stringify(this.results), err => {
      if (err) log.error('There was an error adding info to the JSON file', 'red');
    });
  }

  _displayErrorDetails(failures) {
    failures.forEach(f => {
      log.error(chalk.red('   Test Failure: ') + `${f.test} (${f.screenType})`);
      log.debug(
        ` - Pixel difference: ${f.pixelDifference}\n` +
        ` - Diff location: ${f.diffFileLocation}`
      );
    });
  }

  launchViewer() {
    const resultsFilePath = this.config.diffDirectory + "/results.json";
    log.info(((isWin) ? `${figures.info} ` : '🔍') + ' Testophobia Viewer served on port 8090', 'cyan');
    log.debug(` - using results file: ${resultsFilePath}`);
    serveViewer(this.config, resultsFilePath);
  }

};