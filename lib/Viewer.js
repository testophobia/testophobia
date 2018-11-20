/* global exports, require, process */
const {generateResultFile} = require('./utils/generate-result-file');
const {serveViewer} = require('./utils/serve-viewer');
const figures = require('figures');

const isWin = (process.platform === 'win32');

exports.Viewer = class Viewer {
  constructor(config, path, logger, response = false) {
    this.config = config;
    this.path = path;
    this.logger = logger;
    this.response = response;
  }

  async run() {
    await generateResultFile(this.config, this.response);
    this.logger.displayErrorDetails(this.response.failures);
    if (!this.config.skipViewer) this.launchViewer();
  }

  launchViewer() {
    this._displayViewerMessage();
    serveViewer(this.config, this.path);
  }

  _displayViewerMessage() {
    this.logger.info(((isWin) ? `${figures.info} ` : '🔍') + ' Testophobia Viewer served on port 8090', 'cyan');
    this.logger.debug(` - using results file: ${this.path}`);
  }

};