/* global exports, require */
const fs = require('fs');
const path = require('path');
const request = require('request');
const {TestRunner} = require('./TestRunner');
const {Viewer} = require('./Viewer');
const {asyncForEach} = require('./utils');
const {formatTests} = require('./utils/test/format-tests');
const {resolveDimensions} = require('./utils/test/resolve-dimensions');
const {createTestDirectories, clearTestophobiaDirectories} = require('./utils/test/test-directories');
const {generateConfigFile} = require('./utils/generate/generate-config');
const {generateJUnitXML} = require('./utils/generate/generate-junit-xml');
const {Configuration} = require('./Configuration');
const {Output} = require('./Output');

/**
 * @class Main Testophobia class
 */
exports.Testophobia = class Testophobia {
  /**
   * Creates a Testophobia instance
   *
   * @constructor
   * @param {string} cfgDirectory Override the default config directory
   * @param {Output} output Override the Output instance
   */
  constructor(cfgDirectory, output) {
    this.output = output || /* istanbul ignore next */ new Output();
    this._initializeConfig(cfgDirectory);
    this.output.setConfig(this.config);
    this.testResults = [];
    this._runnerCount = 0;
    this.output.printWelcomeMessage();
  }

  /**
   * Run the tests
   */
  async run() {
    if (await this._checkFlagsAndFiles()) return;
    this._tests = await formatTests(this.config);
    if (!this._tests) this.output.displayFailure('No test files found! Check your config or input path.');
    this.output.calculateTotalTests(this._tests);
    if (Array.isArray(this.config.browser)) {
      await asyncForEach(this.config.browser, async browser => {
        this.output.resetTestCount();
        this.config.currentBrowser = browser;
        await this._executeTests();
      });
    } else {
      this.config.currentBrowser = this.config.browser || 'chromium';
      await this._executeTests();
    }
  }

  _initializeConfig(cfgDirectory) {
    const c = new Configuration(false, cfgDirectory);
    if (c.err && !c.config.init) {
      console.error('Unable to process config files!', c.err);
      this.output.displayFailure(c.err.message);
    }
    this.config = c.config;
    this.pathArg = c.pathArg;
    this.cfgDirectory = c.cfgDirectory;
  }

  async _checkFlagsAndFiles() {
    if (this.config.clear) return await clearTestophobiaDirectories(this.config, this.output, this.pathArg);
    if (this.config.init) return await generateConfigFile(this.config, this.cfgDirectory, message => this.output.displayMessage(message));
    if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}`)) this.output.displayFailure('No Golden Images to Compare.');
    return 0;
  }

  async _executeTests() {
    this._handleSpinner();
    this._testRuns = [];
    this._parallel = this.config.maxParallel > 1;
    if (this.config.before) await this.config.before.apply(undefined, [request]);
    await asyncForEach(this._tests, async test => {
      test.dimensions = await resolveDimensions(this.config, test);
      if (this.config.bail && this.testResults.length) return true;
      const testRouteName = test.name.split('.')[0];
      await createTestDirectories(this.config, this.output, testRouteName, test.dimensions, test.excludeDimensions);
      await asyncForEach(test.dimensions, async d => {
        if (!test.excludeDimensions || !test.excludeDimensions.includes(d.type)) {
          if (this._parallel) {
            this._testRuns.push({name: test.name, test: test, route: testRouteName, dimension: d});
          } else {
            await this._runTestForDimension(test, testRouteName, d);
            if (this.config.bail && this.testResults.length) return true;
          }
        }
      });
      this._handleSpinner();
    });
    if (this._parallel && this._testRuns.length) {
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

  _runTestForDimension(test, testRouteName, d) {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.config.bail && this.testResults.length) resolve();
        if (test.before) await test.before.apply(undefined, [request]);
        const testRunRootDir = path.join(this.config.golden ? this.config.goldenDirectory : this.config.testDirectory, this.config.currentBrowser);
        const tr = new TestRunner(++this._runnerCount, this.config, test, d, testRunRootDir, this.testResults, this.output);
        await tr.run(testRouteName);
        if (test.after) await test.after.apply(undefined, [request]);
        if (this._parallel) this._nextParallelTest(resolve);
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
    if (!this.config.golden && this.config.writeXml)
      generateJUnitXML(path.join(this.config.diffDirectory, this.config.currentBrowser), this._tests, results.failures);
    if (!this.config.golden && results && results.failures.length) {
      const v = new Viewer(this.config);
      v.handleTestResults(results);
    }
  }

  _handleSpinner(finished = false) {
    const bailTriggered = this.config.bail && Boolean(this.testResults.length);
    finished ? this.output.displayTestCompletion(bailTriggered, this.testResults) : this.output.updateSpinnerDisplay(bailTriggered, this.testResults);
  }

  _parallelRunComplete() {
    //for testing
  }
};
