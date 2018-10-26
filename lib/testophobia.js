/* global require, global, process, exports, module */
'use strict';
const chalk = require('chalk');
const figures = require('figures');
const {loadConfig, configDefaults} = require('./load-config');
const meow = require('meow');
const {ScreenGenerator} = require('./screen-generator');
const {asyncForEach, Logger} = require('./utils');
const {serveViewer} = require('./serve-viewer');
const glob = require('glob');
const path = require('path');
const esm = require('esm');
const rimraf = require('rimraf');
const fs = require('fs');

global.response = 0;

const log = new Logger(Logger.INFO_LEVEL);
const isWin = (process.platform === 'win32');

exports.Testophobia = class Testophobia {
  constructor(config = {}) {
    this.config = config;
  }

  async run(testPath = false) {
    let passedConfigTests = this.config.tests || false;
    this.configure();
    let target = testPath ? testPath : passedConfigTests ? passedConfigTests : this.cli.input[0] ? this.cli.input[0] : this.config.tests;
    this._printWelcomeMessage();
    if (this.config.clear) {
      await this._clearDirectories(this.cli.input[0]);
      return global.response;
    }
    if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}`))
      return log.fatal(figures.cross + '  No Golden Images to Compare.');
    let resp = await this._handleTestPaths(target, this.config.golden);
    if (!this.config.golden && resp && resp.failures.length) this._handleFailures(resp);
    return global.response;
  }

  configure() {
    this._handleConfigs();
  }

  _handleConfigs() {
    let confError = null;
    this.cli = this._configureCliCommands();
    try {
      this.config = Object.assign(loadConfig(this.config), this.cli.flags);
    } catch (error) {
      confError = error;
    }
    if (confError) {
      if (confError.parent) {
        this._exit(`${confError.message}\n${chalk.gray((confError.parent && confError.parent.stack) || confError.parent)}`);
      } else {
        this._exit(confError.message);
      }
    }
    if (this.config.verbose) log.setLevel(Logger.DEBUG_LEVEL);
    if (this.config.init) this._generateConfigFile();
  }

  _configureCliCommands() {
    return meow(
      `
      Usage
        testophobia [<file|directory|glob> ...]
      Options
        --golden, -g             Produce golden images instead of test images
        --bail, -b               Exit on first test failure
        --verbose, -v            Enable verbose output
        --skip-viewer, -s        Prevent viewer auto-launch
        --clear, -c              Remove the generated image directories
        --init, -i               Generate a default config file and exit
      Examples
        testophobia
        testophobia test/**/*.js
    `,
      {
        flags: {
          verbose: {
            type: 'boolean',
            alias: 'v',
            default: this.config && this.config.verbose || false
          },
          skipViewer: {
            type: 'boolean',
            alias: 's',
            default: this.config && this.config.skipViewer || false
          },
          bail: {
            type: 'boolean',
            alias: 'b',
            default: this.config && this.config.bail || false
          },
          golden: {
            type: 'boolean',
            alias: 'g',
            default: this.config && this.config.golden || false
          },
          clear: {
            type: 'boolean',
            alias: 'c',
            default: this.config && this.config.clear || false
          },
          init: {
            type: 'boolean',
            alias: 'i',
            default: this.config && this.config.init || false
          },
          '--': {
            type: 'string'
          }
        }
      }
    );
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
    ]).then(() => log.warn('Testophobia screenshot directories cleared.'));
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

  _generateConfigFile() {
    log.info(((isWin) ? `${figures.info} ` : '😱') + ' Generating Testophobia config...', 'cyan');
    try {
      fs.accessSync('testophobia.config.js');
      log.warn('Testophobia config file already exists!');
    } catch (e) {
      const defaults = configDefaults;
      defaults.tests = [{name: 'home', path: null, delay: null, actions: []}];
      const contents = `export default ${JSON.stringify(defaults, null, 2)};`;
      fs.writeFileSync('testophobia.config.js', contents, (err) => {if (err) throw err;});
      log.info(chalk.green(figures.tick) + '  Done.', 'cyan');
    }
    process.exit(0); // eslint-disable-line no-process-exit
  }

  launchViewer() {
    const resultsFilePath = this.config.diffDirectory + "/results.json";
    log.info(((isWin) ? `${figures.info} ` : '🔍') + ' Testophobia Viewer served on port 8090', 'cyan');
    log.debug(` - using results file: ${resultsFilePath}`);
    serveViewer(this.config, resultsFilePath);
  }
};