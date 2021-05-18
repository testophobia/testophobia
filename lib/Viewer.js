import {generateResultFile} from './utils/generate/generate-result-file.js';
import {serveViewer} from './utils/viewer/serve-viewer.js';
import {Output} from './Output.js';
import {Configuration} from './Configuration.js';

/**
 * @class Configure and launch the Testophobia Viewer
 */
export class Viewer {
  /**
   * Initializes an instance of Viewer
   *
   * @param {object} config Optional Testophobia config object
   */
  async init(config) {
    return new Promise(async (resolve, reject) => {
      this.output = new Output();
      this.config = !config ? (await this._initializeConfig()).config : config;
      this.output.setConfig(this.config);
      this.resultsFile = this.config.diffDirectory + '/' + this.config.currentBrowser + '/results.json';
      resolve();
    });
  }

  async _initializeConfig() {
    const c = new Configuration();
    await c.init(true);
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
