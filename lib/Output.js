import ora from 'ora';
import chalk from 'chalk';
import {Logger} from './Logger.js';
import figures from 'figures';
import {resolveDimensions} from './utils/test/resolve-dimensions.js';

const log = new Logger(Logger.INFO_LEVEL);
const isWin = process.platform === 'win32';

/**
 * @class Handles output to the user (CLI and log output)
 */
export class Output {
  constructor() {
    this.isGolden = false;
    this.currentTest = 0;
    this.spinner = new ora();
    this.total = 0;
  }

  /**
   * Apply configs to the output (verbose/debug/golden/etc)
   *
   * @param {object} config The Testophpbia config object
   */
  setConfig(config) {
    this.config = config;
    this.isGolden = config.golden || false;
    if (config.verbose || config.debug) this._getLog().setLevel(Logger.DEBUG_LEVEL);
  }

  /**
   * Update the CLI status with the current pass/fail/golden numbers
   *
   * @param {boolean} bailTriggered Was the test run bailed?
   * @param {array} results The current test results information
   * @param {boolean} shouldUpdateCountDisplay Render the pass/fail/golden info (vs just a status message)
   */
  updateSpinnerDisplay(bailTriggered, results, shouldUpdateCountDisplay = false) {
    if (this.isGolden && !this.spinner.isSpinning) this.spinner.start();
    if (shouldUpdateCountDisplay) {
      const failed = (results && results.length) || 0;
      const passed = Math.max(this.currentTest - failed, 0);
      const pending = this.total - (passed + failed);
      const doneText = this.isGolden ? 'done' : 'passed';
      let prefix;
      if (this.isGolden) prefix = chalk.cyan(pending ? 'Generating Goldens' : 'Generation Complete');
      else prefix = chalk.cyan(pending ? 'Running Tests' : 'Testing Complete');
      if (bailTriggered) prefix = chalk.cyan('Bailed');
      prefix += ` (${this.config.currentBrowser})`;
      const msg =
        ` ${prefix} [${chalk.green(`${passed} ${doneText}`)}` +
        (this.isGolden ? '' : ` | ${chalk.red(`${failed} failed`)}`) +
        `${pending ? ` | ${pending} pending` : ''}]`;
      const msgChanged = msg !== this._prevStatusUpdate;
      if ((msgChanged || !this.config.logOutput) && !this.isGolden && !this.spinner.isSpinning) this.spinner.start();
      if (msgChanged) this.spinner.text = this._prevStatusUpdate = msg;
    } else {
      if (!this.isGolden && !this.config.logOutput && !this.spinner.isSpinning) this.spinner.start();
    }
  }

  /**
   * Figure out the total count of test actions for all tests/dimensions
   *
   * @param {array} tests Array of tests to calculate totals
   */
  calculateTotalTests(tests) {
    let total = 0;
    let dims;
    tests.forEach(t => {
      dims = resolveDimensions(this.config, t);
      dims.forEach(d => {
        if (!t.excludeDimensions || !t.excludeDimensions.includes(d.type)) {
          if (!t.skipScreen) ++total;
          if (t.actions && t.actions.length)
            t.actions.forEach(a => {
              if (!a.skipScreen && (!a.excludeDimensions || !a.excludeDimensions.includes(d.type))) ++total;
            });
        }
      });
    });
    this.total = total;
  }

  showStats() {
    this._getLog().info('   ' + chalk.green(`${this.total} tests found`), 'cyan');
  }

  /**
   * Write out a debug message above the active spinner output
   *
   * @param {string} message The message to append
   * @param {boolean} bailTriggered Was the test run bailed?
   * @param {array} results The current test results information
   * @param {boolean} shouldUpdateCountDisplay Render the pass/fail/golden info (vs just a status message)
   */
  prependDebugMessageToSpinner(message, bailTriggered, results, shouldUpdateCountDisplay = false) {
    this.spinner.stop();
    this._getLog().debug(message);
    this.updateSpinnerDisplay(bailTriggered, results, shouldUpdateCountDisplay);
  }

  /**
   * Write final spinner output (pass or fail)
   *
   * @param {boolean} bailTriggered Was the test run bailed?
   * @param {array} results The current test results information
   * @param {string} userOutput String to add to the final console output
   */
  displayTestCompletion(bailTriggered, results, userOutput) {
    if (!!userOutput && userOutput !== 'undefined') this.spinner.text += '\n\n====  User Output ====\n\n' + userOutput;
    if (bailTriggered) {
      this.updateSpinnerDisplay(bailTriggered, results);
      this.spinner.fail();
    } else {
      this.spinner.succeed();
    }
  }

  /**
   * Increment the current test counter
   */
  incrementTestCount() {
    ++this.currentTest;
  }

  /**
   * Reset the current test counter
   */
  resetTestCount() {
    this.currentTest = 0;
  }

  /**
   * Write a failure message and exit the test run with a failure
   *
   * @param {string} message The failure message
   */
  displayFailure(message) {
    this.spinner.fail();
    this._getLog().fatal(figures.cross + '  ' + message);
  }

  /**
   * Write the list of failures to the output
   *
   * @param {array} failures The set of failures to output
   */
  displayErrorDetails(failures) {
    this._getLog().displayErrorDetails(failures);
  }

  /**
   * Output a warning message
   *
   * @param {string} message The warning message
   */
  displayWarning(message) {
    this._getLog().warn(message);
  }

  /**
   * Output a message
   *
   * @param {string} message The message
   */
  displayMessage(message) {
    this._getLog().info(message);
  }

  /**
   * Output a debug message
   *
   * @param {string} message The debug message
   */
  displayDebugMessage(message) {
    this._getLog().debug(message);
  }

  /**
   * Output the initial message
   */
  printWelcomeMessage() {
    this._getLog().info((isWin ? `${figures.info} ` : '😱') + ' Starting Testophobia...', 'cyan');
    this._getLog().debug('config -----------------------------------');
    Object.keys(this.config).forEach(k => {
      if (this.config[k] !== undefined && k.length > 1) this._getLog().debug(`  ${k}: ${JSON.stringify(this.config[k])}`);
    });
    this._getLog().debug('------------------------------------------');
  }

  /**
   * Output a initial viewer message
   *
   * @param {string} path The path to the results file being used in the viewer
   */
  displayViewerMessage(path) {
    this._getLog().info((isWin ? `${figures.info} ` : '🔍') + ' Testophobia Viewer served on port 8090', 'cyan');
    this._getLog().debug(` - using results file: ${path}`);
  }

  _getLog() {
    return log;
  }

  _setSpinner(spinner) {
    //only for testing purposes
    this.spinner = spinner;
  }
};
