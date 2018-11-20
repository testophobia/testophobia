/* global exports, require */
const {Logger} = require('./Logger');
const {ScreenGenerator} = require('./ScreenGenerator');
const {Viewer} = require('./Viewer');
const {formatTests} = require('./utils/format-tests');

const log = new Logger(Logger.INFO_LEVEL);

exports.TestRunner = class TestRunner {
  constructor(config, target) {
    this.config = config;
    this.target = target;
    this.resultsFile = config.diffDirectory + '/results.json';
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

  _executeTests(tests) {
    const sg = new ScreenGenerator(this.config, tests);
    return sg.run();
  }

  _throwFileError() {
    return log.fatal('No test files found! Check your config or input path.');
  }

};