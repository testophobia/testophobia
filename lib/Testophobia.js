/* global exports, require, process */
const fs = require('fs');
const path = require('path');
const request = require('request');
const {TestRunner} = require('./TestRunner');
const {Viewer} = require('./Viewer');
const {formatTests} = require('./utils/format-tests');
const {handleDimensions} = require('./utils/handle-dimensions');
const {asyncForEach, createDirectory} = require('./utils');
const {generateConfigFile} = require('./utils/generate-config');
const {generateJUnitXML} = require('./utils/generate-junit-xml');
const {Configuration} = require('./Configuration');
const {deleteDirectory, deleteGlob} = require('./utils');
const {Output} = require('./Output');

const isWin = process.platform === 'win32';

exports.Testophobia = class Testophobia {
  constructor(options = {}, output) {
    this.output = output || new Output();
    this._initializeConfig(options);
    this.resultsFile = this.config.diffDirectory + '/results.json';
    this.output.setConfig(this.config);
    this.testResults = [];
    this._runnerCount = 0;
  }

  _initializeConfig(op) {
    try {
      let c = new Configuration(op);
      this.config = c.config;
      this.target = c.target;
      this.pathArg = c.pathArg;
    } catch (error) {
      this.output.displayFailure(error.message);
    }
  }

  async run(testPath = false) {
    if (await this._checkFlagsAndFiles()) return;
    this.target = testPath ? testPath : this.target;
    this._tests = await formatTests(this.config, this.target);
    if (!this._tests) {
      this._throwFileError();
      return;
    }
    await this.output.calculateTotalTests(this._tests);
    await this._executeTests();
  }

  _checkFlagsAndFiles() {
    let {clear, init} = this.config;
    this.output.printWelcomeMessage(isWin, this.config);
    if (clear) return this._clearTestophobiaDirectories(this.pathArg);
    if (init) return generateConfigFile(this.config, file => this.output.displayMessage(`${file} created.`));
    return this._goldenCheck();
  }

  _clearTestophobiaDirectories(path = false) {
    if (path) {
      deleteGlob(path);
      this.output.displayWarning(`${path} cleared.`);
      return 1;
    }
    const deletes = [deleteDirectory(this.config.diffDirectory), deleteDirectory(this.config.testDirectory)];
    if (this.config.golden) deletes.push(deleteDirectory(this.config.goldenDirectory));
    return Promise.all(deletes)
      .then(() => {
        this.output.displayWarning(`Testophobia directories cleared.`);
        return 1;
      })
      .catch(() => 1);
  }

  _goldenCheck() {
    if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}`)) {
      this.output.displayFailure('No Golden Images to Compare.');
      return 1;
    }
    return 0;
  }

  async _executeTests() {
    this._handleSpinner();
    this._testRuns = [];
    const parallel = this._isParallel();
    if (this.config.before) await this.config.before.apply(undefined, [request]);
    await asyncForEach(this._tests, async test => {
      test.dimensions = await handleDimensions(this.config.dimensions, test);
      if (this.config.bail && this.testResults.length) return;
      let testRouteName = test.name.split('.')[0];
      await this._createDirectories(testRouteName, test.dimensions);
      await asyncForEach(test.dimensions, async d => {
        if (parallel) {
          this._testRuns.push({name: test.name, test: test, route: testRouteName, dimension: d});
        } else {
          await this._runTestForDimension(test, testRouteName, d);
        }
      });
      this._handleSpinner();
    });
    if (parallel && this._testRuns.length) {
      this._testsToComplete = this._testRuns.length;
      await asyncForEach(this._testRuns.splice(0, this.config.maxParallel), async r => {
        this._runTestForDimension(r.test, r.route, r.dimension);
        await new Promise(resolve => setTimeout(resolve, 100));
      });
    } else {
      this._testsComplete({
        tests: this._testRuns.map(t => t.name),
        failures: this.testResults,
        bailTriggered: this.config.bail && Boolean(this.testResults.length)
      });
    }
  }

  async _createDirectories(testRouteName, dimensions) {
    if (!this.config.golden && !fs.existsSync(`${this.config.diffDirectory}/`)) createDirectory(`${this.config.diffDirectory}`);
    this.dirToUse = this.config.golden ? this.config.goldenDirectory : this.config.testDirectory;
    await asyncForEach(dimensions, d => {
      if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}/${d.type}/${testRouteName}`))
        this.output.displayFailure('Missing Golden Images');
      const dirToCreate = `${this.dirToUse}/${d.type}/${testRouteName}`;
      if (this.config.golden) deleteDirectory(dirToCreate).then(() => createDirectory(dirToCreate));
      else createDirectory(dirToCreate);
    });
  }

  _runTestForDimension(test, testRouteName, d) {
    return new Promise(async resolve => {
      if (this.config.bail && this.testResults.length) resolve();
      if (test.before) await test.before.apply(undefined, [request]);
      const tr = new TestRunner(++this._runnerCount, this.config, test, d, this.dirToUse, this.testResults, this.output);
      await tr.run(testRouteName);
      if (test.after) await test.after.apply(undefined, [request]);
      if (this._isParallel()) this._nextParallelTest(resolve);
      else resolve();
    });
  }

  _nextParallelTest(resolve) {
    this._testsToComplete--;
    if (this._testRuns.length) {
      const test = this._testRuns.shift();
      this._runTestForDimension(test.test, test.route, test.dimension);
    } else if (this._testsToComplete === 0) {
      this._testsComplete({
        tests: this._testRuns.map(t => t.name),
        failures: this.testResults,
        bailTriggered: this.config.bail && Boolean(this.testResults.length)
      });
    }
    resolve();
  }

  async _testsComplete(results) {
    if (this.config.after) await this.config.after.apply(undefined, [request]);
    this._handleSpinner(true);
    if (!this.config.golden && this.config.writeXml) generateJUnitXML(this.config.diffDirectory, this._tests, results.failures);
    if (!this.config.golden && results && results.failures.length) return this._handleFailures(results);
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

  _isParallel() {
    return this.config.maxParallel > 1;
  }

  _throwFileError() {
    return this.output.displayFailure('No test files found! Check your config or input path.');
  }
};
