/* global exports, require */
const {generateResultFile} = require('./utils/generate-result-file');
const {serveViewer} = require('./utils/serve-viewer');
const {Testophobia} = require('./Testophobia');

exports.Viewer = class Viewer extends Testophobia {
  constructor(response = false) {
    super();
    this.response = response;
  }

  async run() {
    await generateResultFile(this.config, this.response);
    this.output.displayErrorDetails(this.response.failures);
    if (!this.config.skipViewer) this.launchViewer();
  }

  launchViewer() {
    super._displayViewerMessage();
    serveViewer(this.config, this.resultsFile);
  }

};