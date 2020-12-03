/* global exports, require */
const {generateResultFile} = require('./utils/generate/generate-result-file');
const {serveViewer} = require('./utils/viewer/serve-viewer');
const {Output} = require('./Output');
const {Configuration} = require('./Configuration');

/**
 * @class Configure and launch the Testophobia Viewer
 */
exports.Viewer = class Viewer {
  /**
   * Creates an instance of Viewer
   *
   * @constructor
   * @param {object} config Optional Testophobia config object
   */
  constructor(config) {
    this.config = !config ? this._initializeConfig().config : config;
    this.resultsFile = this.config.diffDirectory + '/' + this.config.currentBrowser + '/results.json';
    this.output = new Output(this.config);
  }

  _initializeConfig() {
    const c = new Configuration(true);
    c.config.cliPath = c.cli.input[0];
    if (c.err) return this.output.displayFailure(c.err);
    if (!c.config.browser) c.config.currentBrowser = 'chromium';
    else if (Array.isArray(c.config.browser)) c.config.currentBrowser = c.config.browser[0];
    else c.config.currentBrowser = c.config.browser;
    return c;
  }

  /**
   * Output test failures and load them into the Testophobia Viewer
   *
   * @param {object} config Optional Testophobia config object
   */
  async handleTestResults(testResults) {
    await generateResultFile(this.config, testResults);
    this.output.displayErrorDetails(testResults.failures);
    /* istanbul ignore next */
    if (!this.config.skipViewer) this.launchViewer();
  }

  /**
   * Start the Testophobia Viewer
   */
  /* istanbul ignore next */
  launchViewer() {
    this.output.displayViewerMessage(this.resultsFile);
    serveViewer(this.config, this.resultsFile);
  }
};
