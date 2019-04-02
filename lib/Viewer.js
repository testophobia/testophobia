/* global exports, require, process */
const {generateResultFile} = require('./utils/generate-result-file');
const {serveViewer} = require('./utils/serve-viewer');
const {Output} = require('./Output');
const {Configuration} = require('./Configuration');

const isWin = (process.platform === 'win32');

exports.Viewer = class Viewer {
  constructor(options = false, response = false) {
    let {config} = this._initializeConfig(options);
    this.config = config;
    this.response = response;
    this.resultsFile = config.diffDirectory + '/results.json';
    this.output = new Output(this.config);
  }

  _initializeConfig(op) {
    let c = new Configuration(op, true);
    return c.err ? this.output.displayFailure(c.err) : c;
  }

  async run() {
    await generateResultFile(this.config, this.response);
    this.output.displayErrorDetails(this.response.failures);
    if (!this.config.skipViewer) this.launchViewer();
  }

  launchViewer() {
    this.output.displayViewerMessage(isWin, this.resultsFile);
    serveViewer(this.config, this.resultsFile);
  }
};