/* global require, global, process, exports, module */
'use strict';
const chalk = require('chalk');
const figures = require('figures');
const {Configuration} = require('./Configuration');
const {ScreenGenerator} = require('./ScreenGenerator');
const {asyncForEach} = require('./utils');
const {generateConfigFile} = require('./utils/generate-config');
const {Logger} = require('./Logger');
const {serveViewer} = require('./utils/serve-viewer');
const glob = require('glob');
const path = require('path');
const esm = require('esm');
const rimraf = require('rimraf');
const fs = require('fs');

global.response = 0;

const log = new Logger(Logger.INFO_LEVEL);
const isWin = (process.platform === 'win32');

//throwFileError should write to output 

exports.Testophobia = class Testophobia {
  constructor(config = {}) {
    this.cf = new Configuration(config);
    this.config = this.cf.config;
  }

  init(testPath = false) {
    if (this.config.clear) return this._clearDirectories(this.cli.input[0]);
    if (this.config.init) return generateConfigFile();
    this.run(testPath);
  }

  async run(testPath = false) {
    this._printWelcomeMessage();
    this.target = testPath ? testPath : this.cf.target;

    if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}`))
      return log.fatal(figures.cross + '  No Golden Images to Compare.');

    let resp = await this._handleTestPaths(this.target, this.config.golden);
    if (!this.config.golden && resp && resp.failures.length) this._handleFailures(resp);
    return global.response;
  }

  configure() {
    return this.cf.configure();
  }

  _exit(message) {
    log.error(`${chalk.red(figures.cross)}  ${message}`);
    global.response = 1;
  }

  _throwFileError() {
    return this._exit('No test files found! Check your config or input path.');
  }

  _printWelcomeMessage() {
    log.info(((isWin) ? `${figures.info} ` : '😱') + ' Starting Testophobia...', 'cyan');
    log.debug('config -----------------------------------');
    Object.keys(this.config).forEach(k => {
      if (this.config[k] !== undefined && k.length > 1) log.debug(`  ${k}: ${JSON.stringify(this.config[k])}`);
    });
    log.debug('------------------------------------------');
  }

  _clearDirectories(input = false) {
    if (input) {
      this._deleteDirectory(input);
      return log.warn(`Testophobia directory ${input} cleared.`);
    }
    return Promise.all([
      this._deleteDirectory(this.config.goldenDirectory),
      this._deleteDirectory(this.config.diffDirectory),
      this._deleteDirectory(this.config.testDirectory)
    ]).then(() => 0).catch(() => 1);
  }

  _deleteDirectory(directory) {
    return new Promise(resolve => rimraf(directory, resolve));
  }

  async _handleTestPaths(target, isGolden) {
    if (typeof(target) === 'undefined') return this._throwFileError();
    let testPaths = [];
    if (typeof target === 'object' && target.filter(t => Object.keys(t).includes('name')).length) return this._executeTests(isGolden, this.config.tests);
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