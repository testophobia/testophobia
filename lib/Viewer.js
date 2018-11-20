/* global exports, require, process */
const {generateResultFile} = require('./utils/generate-result-file');
const {serveViewer} = require('./utils/serve-viewer');
const figures = require('figures');
const {Testophobia} = require('./Testophobia');

const isWin = (process.platform === 'win32');

exports.Viewer = class Viewer extends Testophobia {
  constructor(response = false) {
    super();
    this.response = response;
  }

  async run() {
    await generateResultFile(this.config, this.response);
    this.log.displayErrorDetails(this.response.failures);
    if (!this.config.skipViewer) this.launchViewer();
  }

  launchViewer() {
    this._displayViewerMessage();
    serveViewer(this.config, this.resultsFile);
  }

  _displayViewerMessage() {
    this.log.info(((isWin) ? `${figures.info} ` : '🔍') + ' Testophobia Viewer served on port 8090', 'cyan');
    this.log.debug(` - using results file: ${this.path}`);
  }

};