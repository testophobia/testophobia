/* global exports, require */
const ora = require('ora');
const chalk = require('chalk');
const {Logger} = require('./Logger');
const figures = require('figures');

const log = new Logger(Logger.INFO_LEVEL);

exports.Output = class Output {
  constructor(config, isGolden, tests, dimensions) {
    this.isGolden = isGolden;
    this.currentTest = 0;
    this.spinner = new ora();
    if (config.verbose || config.debug) log.setLevel(Logger.DEBUG_LEVEL);
    this.total = this.calculateTotalTests(tests, dimensions);
  }

  updateSpinnerDisplay(bailTriggered, results) {
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
    this.spinner.text = ` ${prefix} [${chalk.green(`${passed} ${doneText}`)}` +
      ((this.isGolden) ? '' : ` | ${chalk.red(`${failed} failed`)}`) +
      `${(pending) ? ` | ${pending} pending` : ''}]`;
  }

  calculateTotalTests(tests, dimensions) {
    let total = 0;
    tests.map(t => total += t.actions ? dimensions.length + this.resolveActionCounts(t, dimensions) : dimensions.length);
    return total;
  }

  resolveActionCounts(test, dimensions) {
    let count = 0;
    test.actions.forEach(a => {
      count += a.skipScreen ? 0 : a.excludeDimensions ? (dimensions.length - a.excludeDimensions.length) : dimensions.length;
    });
    return count;
  }

  prependDebugMessageToSpinner(message, bailTriggered, results) {
    this.spinner.stop();
    log.debug(message);
    this.updateSpinnerDisplay(bailTriggered, results);
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

};