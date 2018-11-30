/* global exports, require, process */
const chalk = require('chalk');
const figures = require('figures');

exports.Logger = class Logger {
  static get DEBUG_LEVEL() {return 200;}
  static get INFO_LEVEL() {return 400;}
  static get WARN_LEVEL() {return 600;}
  static get ERROR_LEVEL() {return 800;}

  constructor(level) {
    this._level = level;
  }

  setLevel(level) {
    this._level = level;
  }

  debug(message, chalkColor = 'dim') {
    if (this._level <= Logger.DEBUG_LEVEL) this.log(message, 'info', chalkColor);
  }

  info(message, chalkColor) {
    if (this._level <= Logger.INFO_LEVEL) this.log(message, 'info', chalkColor);
  }

  warn(message, chalkColor) {
    if (this._level <= Logger.WARN_LEVEL) this.log(chalk.yellow(figures.warning + '  ' + message), 'warn', chalkColor);
  }

  error(message, chalkColor) {
    if (this._level <= Logger.ERROR_LEVEL) this.log(message, 'error', chalkColor);
  }

  fatal(message) {
    this.log(message, 'error', 'red');
    process.exit(1); // eslint-disable-line no-process-exit
  }

  log(message, consoleLevel, chalkColor) {
    if (chalkColor) message = chalk[chalkColor](message);
    console[consoleLevel](message); // eslint-disable-line no-console
  }

  displayErrorDetails(failures) {
    failures.forEach(f => {
      this.error(chalk.red('   Test Failure: ') + `${f.test} (${f.screenType}) ${f.action}`);
      this.debug(
        ` - Pixel difference: ${f.pixelDifference}\n` +
        ` - Diff location: ${f.diffFileLocation}`
      );
    });
  }

};
