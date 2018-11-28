/* global exports, require, process */
const {generateResultFile} = require('./utils/generate-result-file');
const {serveViewer} = require('./utils/serve-viewer');
const {Output} = require('./Output');

const isWin = (process.platform === 'win32');

exports.Viewer = class Viewer {
  constructor(config, response = false) {
    this.response = response;
    this.config = config;
    this.resultsFile = config.diffDirectory + '/results.json';
    this.output = new Output(config);
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