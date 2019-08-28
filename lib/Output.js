/* global exports, require */
const ora = require('ora');
const chalk = require('chalk');
const {Logger} = require('./Logger');
const figures = require('figures');
const {handleDimensions} = require('./utils/handle-dimensions');

const log = new Logger(Logger.INFO_LEVEL);

exports.Output = class Output {
  constructor() {
    this.isGolden = false;
    this.currentTest = 0;
    this.spinner = new ora();
    this.total = 0;
  }

  setConfig(config) {
    this.config = config;
    this.isGolden = config.golden || false;
    if (config.verbose || config.debug) this._getLog().setLevel(Logger.DEBUG_LEVEL);
  }

  updateSpinnerDisplay(bailTriggered, results, shouldUpdateCountDisplay = false) {
    if (this.isGolden && !this.spinner.isSpinning) this.spinner.start();
    const failed = (results && results.length) || 0;
    const passed = Math.max(this.currentTest - failed, 0);
    const pending = this.total - (passed + failed);
    let prefix;
    let doneText = this.isGolden ? 'done' : 'passed';
    if (this.isGolden) prefix = chalk.cyan(pending ? 'Generating Goldens' : 'Generation Complete');
    else prefix = chalk.cyan(pending ? 'Running Tests' : 'Testing Complete');
    if (bailTriggered) prefix = chalk.cyan('Bailed');
    if (shouldUpdateCountDisplay) {
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

  calculateTotalTests(tests) {
    let total = 0;
    tests.map(t => (total += t.actions ? this._resolveDimensionCounts(t) + this._resolveActionCounts(t) : this._resolveDimensionCounts(t)));
    this.total = total;
  }

  _getLog() {
    return log;
  }

  _getSpinner() {
    //only for testing purposes
    return this.spinner;
  }

  _resolveDimensionCounts(test) {
    this.dimensions = handleDimensions(this.config.dimensions, test);
    return this.dimensions.length;
  }

  _resolveActionCounts(test) {
    let count = 0;
    test.actions.forEach(a => {
      count += a.skipScreen ? 0 : a.excludeDimensions ? this.dimensions.length - a.excludeDimensions.length : this.dimensions.length;
    });
    return count;
  }

  prependDebugMessageToSpinner(message, bailTriggered, results, shouldUpdateCountDisplay = false) {
    this.spinner.stop();
    this._getLog().debug(message);
    this.updateSpinnerDisplay(bailTriggered, results, shouldUpdateCountDisplay);
  }

  displayTestCompletion(bailTriggered, results) {
    if (bailTriggered) {
      this.updateSpinnerDisplay(bailTriggered, results);
      this.spinner.fail();
    } else {
      this.spinner.succeed();
    }
  }

  incrementTestCount(value = 1) {
    this.currentTest += value;
  }

  displayFailure(message) {
    this.spinner.fail();
    this._getLog().fatal(figures.cross + '  ' + message);
  }

  displayErrorDetails(failures) {
    return this._getLog().displayErrorDetails(failures);
  }

  displayWarning(message) {
    return this._getLog().warn(message);
  }

  displayMessage(message) {
    return this._getLog().info(message);
  }

  printWelcomeMessage(isWin, config) {
    this._getLog().info((isWin ? `${figures.info} ` : '😱') + ' Starting Testophobia...', 'cyan');
    this._getLog().debug('config -----------------------------------');
    Object.keys(config).forEach(k => {
      if (config[k] !== undefined && k.length > 1) this._getLog().debug(`  ${k}: ${JSON.stringify(config[k])}`);
    });
    this._getLog().debug('------------------------------------------');
  }

  displayViewerMessage(isWin, path) {
    this._getLog().info((isWin ? `${figures.info} ` : '🔍') + ' Testophobia Viewer served on port 8090', 'cyan');
    this._getLog().debug(` - using results file: ${path}`);
  }
};
