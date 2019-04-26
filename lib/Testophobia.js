/* global exports, require, process */
const {TestRunner} = require('./TestRunner');
const {Viewer} = require('./Viewer');
const {formatTests} = require('./utils/format-tests');
const {handleDimensions} = require('./utils/handle-dimensions');
const {asyncForEach, createDirectory} = require('./utils');
const {generateConfigFile} = require('./utils/generate-config');
const fs = require('fs');
const {Configuration} = require('./Configuration');
const {deleteDirectory,deleteGlob} = require('./utils');
const {Output} = require('./Output');

const isWin = (process.platform === 'win32');

exports.Testophobia = class Testophobia {
  constructor(options = {}) {
    let {config, target, pathArg} = this._initializeConfig(options);
    this.config = config;
    this.target = target;
    this.pathArg = pathArg;
    this.resultsFile = config.diffDirectory + '/results.json';
    this.output = new Output(this.config);
    this.testResults = [];
  }

  _initializeConfig(op) {
    let c = new Configuration(op);
    return c.err ? this.output.displayFailure(c.err) : c;
  }

  async run(testPath = false) {
    let exit = await this._checkFlagsAndFiles();
    if (exit) return;
    this.target = testPath ? testPath : this.target;
    let tests = await formatTests(this.config, this.target);
    if (!tests) this._throwFileError();
    await this.output.calculateTotalTests(tests);
    let results = await this._executeTests(tests);
    this._handleSpinner(true);
    if (!this.config.golden && results && results.failures.length) return this._handleFailures(results);
    return 0;
  }

  _checkFlagsAndFiles() {
    let {clear, init} = this.config;
    this.output.printWelcomeMessage(isWin, this.config);
    if (clear) return this._clearTestophobiaDirectories(this.pathArg);
    if (init) return generateConfigFile(this.config, file => this.output.displayMessage(`${file} created.`));
    return this._goldenCheck() ? 1 : 0;
  }

  _clearTestophobiaDirectories(path = false) {
    if (path) {
      deleteGlob(path);
      this.output.displayWarning(`${path} cleared.`);
      return 1;
    }
    const deletes = [
      deleteDirectory(this.config.diffDirectory),
      deleteDirectory(this.config.testDirectory)
    ];
    if (this.config.golden) deletes.push(deleteDirectory(this.config.goldenDirectory));
    return Promise.all(deletes).then(() => {
      this.output.displayWarning(`Testophobia directories cleared.`);
      return 1;
    }).catch(() => 1);
  }

  _goldenCheck() {
    if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}`)) {
      this.output.displayFailure('No Golden Images to Compare.');
      return 1;
    }
    return 0;
  }

  async _executeTests(tests) {
    this._handleSpinner();
    await asyncForEach(tests, async test => {
      let dimensions = await handleDimensions(this.config.dimensions, test);
      if ((this.config.bail && this.testResults.length)) return;
      let testRouteName = test.name.split('.')[0];
      await this._createDirectories(testRouteName, dimensions);
      await asyncForEach(dimensions, async d => {
        await this._runTestForDimension(test, testRouteName, d);
      });
      this._handleSpinner();
    });
    return {tests: tests.map(t => t.name), failures: this.testResults, bailTriggered: this.config.bail && Boolean(this.testResults.length)};
  }

  async _createDirectories(testRouteName, dimensions) {
    if (!this.config.golden && !fs.existsSync(`${this.config.diffDirectory}/`)) createDirectory(`${this.config.diffDirectory}`);
    this.dirToUse = this.config.golden ? this.config.goldenDirectory : this.config.testDirectory;
    await asyncForEach(dimensions, d => {
      if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}/${d.type}/${testRouteName}`)) this.output.displayFailure('Missing Golden Images');
      const dirToCreate = `${this.dirToUse}/${d.type}/${testRouteName}`;
      if (this.config.golden)
        deleteDirectory(dirToCreate).then(() => createDirectory(dirToCreate));
      else
        createDirectory(dirToCreate);
    });
  }

  _runTestForDimension(test, testRouteName, d) {
    if ((this.config.bail && this.testResults.length)) return;
    const tr = new TestRunner(this.config, test, d, this.dirToUse, this.testResults, this.output);
    return tr.run(testRouteName);
  }

  _handleSpinner(finished = false) {
    const bailTriggered = this.config.bail && Boolean(this.testResults.length);
    finished ? this.output.displayTestCompletion(bailTriggered, this.testResults) : this.output.updateSpinnerDisplay(bailTriggered, this.testResults);
  }

  _handleFailures(results) {
    let v = new Viewer(this.config, results);
    v.run();
    return 1;
  }

  _throwFileError() {
    return this.output.displayFailure('No test files found! Check your config or input path.');
  }

};