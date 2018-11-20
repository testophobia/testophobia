/* global exports, require */
const {ScreenGenerator} = require('./ScreenGenerator');
const {Testophobia} = require('./Testophobia');
const {ScreenCompare} = require('./ScreenCompare');
const {Viewer} = require('./Viewer');
const {formatTests} = require('./utils/format-tests');
const {asyncForEach, createDirectory} = require('./utils');
const fs = require('fs');

exports.TestRunner = class TestRunner extends Testophobia {
  constructor(options = {}) {
    super(options);
    this.testResults = [];
  }

  async run(testPath = false) {
    let shouldRun = await super.checkFlagsAndFiles();
    if (!shouldRun) return;
    this.target = testPath ? testPath : this.target;
    let tests = await formatTests(this.config, this.target);
    if (!tests) this._throwFileError();
    await this.output.calculateTotalTests(tests);
    let results = await this._executeTests(tests);
    this._handleSpinner(true);
    if (!this.config.golden && results && results.failures.length) return this._handleFailures(results);
    return 0;
  }

  async _executeTests(tests) {
    await asyncForEach(tests, async test => {
      if ((this.config.bail && this.testResults.length)) return;
      let testRouteName = test.name.split('.')[0];
      await this._createDirectories(testRouteName);
      await asyncForEach(this.config.dimensions, async d => {
        await this._generateScreenshots(test, testRouteName, d);
        if (!this.config.golden) await this._runComparison(test, testRouteName, d);
        this.output.incrementTestCount();
      });
      this._handleSpinner();
    });
    return {tests: tests.map(t => t.name), failures: this.testResults, bailTriggered: this.config.bail && Boolean(this.testResults.length)};
  }

  async _createDirectories(testRouteName) {
    if (!this.config.golden && !fs.existsSync(`${this.config.diffDirectory}/`)) createDirectory(`${this.config.diffDirectory}`);
    this.dirToUse = this.config.golden ? this.config.goldenDirectory : this.config.testDirectory;
    await asyncForEach(this.config.dimensions, d => {
      if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}/${d.type}/${testRouteName}`)) this.output.displayFailure('Missing Golden Images');
      createDirectory(`${this.dirToUse}/${d.type}/${testRouteName}`);
    });
  }

  _generateScreenshots(test, testRouteName, d) {
    if ((this.config.bail && this.testResults.length)) return;
    const sg = new ScreenGenerator(this.config, test, d.type, this.dirToUse, this.output, this.testResults);
    return sg.run(testRouteName);
  }

  async _runComparison(test, testRouteName, d) {
    let resp = await this._compareScreenshots(test, d, testRouteName);
    await this.testResults.push.apply(this.testResults, resp);
    if (resp.length) this.output.prependDebugMessageToSpinner('Screenshot was not a match!', false, this.testResults);
  }

  _compareScreenshots(test, dimension, testRouteName) {
    this.output.prependDebugMessageToSpinner(`Comparing Screenshots - ${testRouteName} (${dimension.type})`, false, this.testResults);
    const sc = new ScreenCompare(this.config, test, dimension);
    return sc.run(testRouteName);
  }

  _handleSpinner(finished = false) {
    const bailTriggered = this.config.bail && Boolean(this.testResults.length);
    finished ? this.output.displayTestCompletion(bailTriggered, this.testResults) : this.output.updateSpinnerDisplay(bailTriggered, this.testResults);
  }

  _handleFailures(results) {
    let v = new Viewer(results);
    v.run();
    return 1;
  }

  _throwFileError() {
    return this.output.displayFailure('No test files found! Check your config or input path.');
  }

};