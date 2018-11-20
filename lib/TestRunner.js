/* global exports, require */
const {Logger} = require('./Logger');
const {ScreenGenerator} = require('./ScreenGenerator');
const {ScreenCompare} = require('./ScreenCompare');
const {Viewer} = require('./Viewer');
const {formatTests} = require('./utils/format-tests');
const {asyncForEach, createDirectory} = require('./utils');
const fs = require('fs');
const {Output} = require('./Output');

const log = new Logger(Logger.INFO_LEVEL);


exports.TestRunner = class TestRunner {
  constructor(config, target) {
    this.initialConfig = config;
    this.config = config;
    this.target = target;
    this.resultsFile = config.diffDirectory + '/results.json';
    this.testResults = [];
  }

  async run() {
    let response = 0;
    let tests = await formatTests(this.config, this.target);
    if (!tests) this._throwFileError();
    let results = await this._executeTests(tests);
    if (!this.config.golden && results && results.failures.length) {
      let v = new Viewer(this.config, this.resultsFile, log, results);
      v.run();
      return response = 1;
    }
    return response;
  }

  async _executeTests(tests) {
    this.output = new Output(this.config, tests);
    await asyncForEach(tests, async test => {
      if ((this.config.bail && this.testResults.length)) return;
      let testRouteName = test.name.split('.')[0];
      await this.createDirectories(testRouteName);
      await asyncForEach(this.config.dimensions, async d => {
        if ((this.config.bail && this.testResults.length)) return;
        const sg = new ScreenGenerator(this.config, test, d.type, this.dirToUse, this.output);
        await sg.run(testRouteName);
        if (!this.config.golden) {
          this.output.prependDebugMessageToSpinner(`Comparing Screenshots - ${testRouteName} (${d.type})`, false, this.testResults);
          let resp = await this.compareScreenshot(test, d, testRouteName);
          await this.testResults.push.apply(this.testResults, resp);
          if (resp.length) this.output.prependDebugMessageToSpinner('Screenshot was not a match!', false, this.testResults);
        }
        this.output.incrementTestCount();
      });
      const bailTriggered = this.config.bail && Boolean(this.testResults.length);
      this.output.updateSpinnerDisplay(bailTriggered, this.testResults);
    });
    const bailTriggered = this.config.bail && Boolean(this.testResults.length);
    this.output.displayTestCompletion(bailTriggered, this.testResults);
    return {tests: tests.map(t => t.name), failures: this.testResults, bailTriggered};
  }

  async createDirectories(testRouteName) {
    if (!this.config.golden && !fs.existsSync(`${this.config.diffDirectory}/`)) createDirectory(`${this.config.diffDirectory}`);
    this.dirToUse = this.config.golden ? this.config.goldenDirectory : this.config.testDirectory;
    await asyncForEach(this.config.dimensions, d => {
      if (!this.config.golden && !fs.existsSync(`${this.config.goldenDirectory}/${d.type}/${testRouteName}`)) this.output.displayFailure('Missing Golden Images');
      createDirectory(`${this.dirToUse}/${d.type}/${testRouteName}`);
    });
  }

  compareScreenshot(test, dimension, testRouteName) {
    const sc = new ScreenCompare(this.initialConfig, test, dimension);
    return sc.run(testRouteName);
  }

  _throwFileError() {
    return log.fatal('No test files found! Check your config or input path.');
  }

};