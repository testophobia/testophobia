/* global exports, require, process */
const fs = require('fs');
const path = require('path');
const request = require('request');
const {TestRunner} = require('./TestRunner');
const {Viewer} = require('./Viewer');
const {asyncForEach} = require('./utils');
const {formatTests} = require('./utils/test/format-tests');
const {handleDimensions} = require('./utils/test/handle-dimensions');
const {createDirectory, deleteDirectory, deleteGlob} = require('./utils/file/file');
const {generateConfigFile} = require('./utils/config/generate-config');
const {generateJUnitXML} = require('./utils/generate-junit-xml');
const {Configuration} = require('./Configuration');
const {Output} = require('./Output');

const isWin = process.platform === 'win32';

exports.Testophobia = class Testophobia {
  constructor(cfgDirectory, output) {
    this.output = output || /* istanbul ignore next */ new Output();
    this._initializeConfig(cfgDirectory);
    this.resultsFile = this.config.diffDirectory + '/results.json';
    this.output.setConfig(this.config);
    this.testResults = [];
    this._runnerCount = 0;
    this.output.printWelcomeMessage(isWin, this.config);
  }

  _initializeConfig(cfgDirectory) {
    let c = new Configuration(false, cfgDirectory);
    if (c.err) {
      this.config = {};
      this.output.displayFailure(c.err);
    }
    this.config = c.config;
    this.pathArg = c.pathArg;
    this.cfgDirectory = c.cfgDirectory;
  }

  async run() {
    if (await this._checkFlagsAndFiles()) return;
    this._tests = await formatTests(this.config);
    if (!this._tests) this._throwFileError();
    await this.output.calculateTotalTests(this._tests);
    await this._executeTests();
  }

  _checkFlagsAndFiles() {
    let {clear, init} = this.config;
    if (clear) return this._clearTestophobiaDirectories(this.pathArg);
    if (init) return generateConfigFile(this.config, message => this.output.displayMessage(message), this.cfgDirectory);
    return this._goldenCheck();
  }

  _clearTestophobiaDirectories(path) {
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
      if (this.config.bail && this.testResults.length) return true;
      let testRouteName = test.name.split('.')[0];
      await this._createDirectories(testRouteName, test.dimensions, test.excludeDimensions);
      await asyncForEach(test.dimensions, async d => {
        if (!test.excludeDimensions || !test.excludeDimensions.includes(d.type)) {
          if (parallel) {
            this._testRuns.push({name: test.name, test: test, route: testRouteName, dimension: d});
          } else {
            await this._runTestForDimension(test, testRouteName, d);
            if (this.config.bail && this.testResults.length) return true;
          }
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

  async _createDirectories(testRouteName, dimensions, excludes) {
    if (!this.config.golden && !fs.existsSync(`${this.config.diffDirectory}/`)) createDirectory(`${this.config.diffDirectory}`);
    this.dirToUse = this.config.golden ? this.config.goldenDirectory : this.config.testDirectory;
    await asyncForEach(dimensions, d => {
      if (!excludes || !excludes.includes(d.type)) {
        const dirToCheck = `${this.config.goldenDirectory}/${d.type}/${testRouteName}`;
        if (!this.config.golden && !fs.existsSync(dirToCheck)) this.output.displayFailure('Missing Golden Images: ' + dirToCheck);
        const dirToCreate = `${this.dirToUse}/${d.type}/${testRouteName}`;
        if (this.config.golden) deleteDirectory(dirToCreate).then(() => createDirectory(dirToCreate));
        else createDirectory(dirToCreate);
      }
    });
  }

  _runTestForDimension(test, testRouteName, d) {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.config.bail && this.testResults.length) resolve();
        if (test.before) await test.before.apply(undefined, [request]);
        const tr = new TestRunner(++this._runnerCount, this.config, test, d, this.dirToUse, this.testResults, this.output);
        await tr.run(testRouteName);
        if (test.after) await test.after.apply(undefined, [request]);
        if (this._isParallel()) this._nextParallelTest(resolve);
        else resolve();
      } catch (e) {
        reject(e.message);
      }
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
      this._parallelRunComplete();
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

  _parallelRunComplete() {
    //for testing
  }

  _throwFileError() {
    return this.output.displayFailure('No test files found! Check your config or input path.');
  }
};
