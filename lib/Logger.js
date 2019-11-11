/* global exports, require, process */
const chalk = require('chalk');
const figures = require('figures');

/**
 * @class Handles console output
 */
exports.Logger = class Logger {
  static get DEBUG_LEVEL() {
    return 200;
  }
  static get INFO_LEVEL() {
    return 400;
  }
  static get WARN_LEVEL() {
    return 600;
  }
  static get ERROR_LEVEL() {
    return 800;
  }

  /**
   * Handles console output
   *
   * @constructor
   * @param {int} level The log level of the logger
   */
  constructor(level) {
    this._level = level;
  }

  /**
   * Change the log level
   *
   * @param {int} level The new log level of the logger
   */
  setLevel(level) {
    this._level = level;
  }

  /**
   * Write a debug level message
   *
   * @param {string} message The message to log
   * @param {string} chalkColor Optional chalk color to use for the message
   */
  debug(message, chalkColor = 'dim') {
    /* istanbul ignore else */
    if (this._level <= Logger.DEBUG_LEVEL) this._log(message, 'info', chalkColor);
  }

  /**
   * Write an info level message
   *
   * @param {string} message The message to log
   * @param {string} chalkColor Optional chalk color to use for the message
   */
  info(message, chalkColor) {
    /* istanbul ignore else */
    if (this._level <= Logger.INFO_LEVEL) this._log(message, 'info', chalkColor);
  }

  /**
   * Write a warning level message
   *
   * @param {string} message The message to log
   * @param {string} chalkColor Optional chalk color to use for the message
   */
  warn(message, chalkColor) {
    /* istanbul ignore else */
    if (this._level <= Logger.WARN_LEVEL) this._log(chalk.yellow(figures.warning + '  ' + message), 'warn', chalkColor);
  }

  /**
   * Write an error level message
   *
   * @param {string} message The message to log
   * @param {string} chalkColor Optional chalk color to use for the message
   */
  error(message, chalkColor) {
    /* istanbul ignore else */
    if (this._level <= Logger.ERROR_LEVEL) this._log(message, 'error', chalkColor);
  }

  /**
   * Write a fatal level message and exit the application
   *
   * @param {string} message The message to log
   */
  fatal(message) {
    this._log(message, 'error', 'red');
    process.exit(1); // eslint-disable-line no-process-exit
    throw new Error('Process Exited'); //only used in tests
  }

  /**
   * Log out the list of failures
   *
   * @param {array} failures The set of failures to log
   */
  displayErrorDetails(failures) {
    failures.forEach(f => {
      this.error(chalk.red('   Test Failure: ') + `${f.test} (${f.screenType}) ${f.action}`);
      this.debug(` - Pixel difference: ${f.pixelDifference}\n` + ` - Diff location: ${f.diffFileLocation}`);
    });
  }

  /* istanbul ignore next */
  _log(message, consoleLevel, chalkColor) {
    if (chalkColor) message = chalk[chalkColor](message);
    console[consoleLevel](message); // eslint-disable-line no-console
  }
};
