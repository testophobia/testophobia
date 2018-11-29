/* global exports, require */
const ora = require('ora');
const chalk = require('chalk');
const {Logger} = require('./Logger');
const figures = require('figures');
const {handleDimensions} = require('./utils/handle-dimensions');

const log = new Logger(Logger.INFO_LEVEL);

exports.Output = class Output {
  constructor(config) {
    this.isGolden = config.golden || false;
    this.config = config;
    this.currentTest = 0;
    this.spinner = new ora();
    if (config.verbose || config.debug) log.setLevel(Logger.DEBUG_LEVEL);
    this.total = 0;
  }

  updateSpinnerDisplay(bailTriggered, results, shouldUpdate = false) {
    if (!this.spinner.isSpinning) this.spinner.start();
    const failed = (results && results.length) || 0;
    const passed = Math.max(this.currentTest - failed, 0);
    const pending = this.total - (passed + failed);
    let prefix;
    let doneText = (this.isGolden) ? 'done' : 'passed';
    if (this.isGolden)
      prefix = chalk.cyan((pending) ? 'Generating Goldens' : 'Generation Complete');
    else
      prefix = chalk.cyan((pending) ? 'Running Tests' : 'Testing Complete');
    if (bailTriggered) prefix = chalk.cyan('Bailed');
    if (shouldUpdate) {
      this.spinner.text = ` ${prefix} [${chalk.green(`${passed} ${doneText}`)}` +
        ((this.isGolden) ? '' : ` | ${chalk.red(`${failed} failed`)}`) +
        `${(pending) ? ` | ${pending} pending` : ''}]`;
    }
  }

  calculateTotalTests(tests) {
    let total = 0;
    tests.map(t => total += t.actions ? this._resolveDimensionCounts(t) + this._resolveActionCounts(t) : this._resolveDimensionCounts(t));
    this.total = total;
  }

  _resolveDimensionCounts(test) {
    this.dimensions = handleDimensions(this.config.dimensions, test);
    return this.dimensions.length;
  }

  _resolveActionCounts(test) {
    let count = 0;
    test.actions.forEach(a => {
      count += a.skipScreen ? 0 : a.excludeDimensions ? (this.dimensions.length - a.excludeDimensions.length) : this.dimensions.length;
    });
    return count;
  }

  prependDebugMessageToSpinner(message, bailTriggered, results, shouldUpdate = false) {
    this.spinner.stop();
    log.debug(message);
    this.updateSpinnerDisplay(bailTriggered, results, shouldUpdate);
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
    log.fatal(figures.cross + message);
  }

  displayErrorDetails(failures) {
    return log.displayErrorDetails(failures);
  }

  displayWarning(message) {
    return log.warn(message);
  }

  displayMessage(message) {
    return log.info(message);
  }

  printWelcomeMessage(isWin, config) {
    log.info(((isWin) ? `${figures.info} ` : '😱') + ' Starting Testophobia...', 'cyan');
    log.debug('config -----------------------------------');
    Object.keys(config).forEach(k => {
      if (config[k] !== undefined && k.length > 1) log.debug(`  ${k}: ${JSON.stringify(config[k])}`);
    });
    log.debug('------------------------------------------');
  }

  displayViewerMessage(isWin, path) {
    log.info(((isWin) ? `${figures.info} ` : '🔍') + ' Testophobia Viewer served on port 8090', 'cyan');
    log.debug(` - using results file: ${path}`);
  }

};