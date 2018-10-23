/* global exports, require */
/* eslint max-classes-per-file: 0 */
const chalk = require("chalk");

exports.Logger = class Logger {
  static get DEBUG_LEVEL() { return 200; }
  static get INFO_LEVEL()  { return 400; }
  static get WARN_LEVEL()  { return 600; }
  static get ERROR_LEVEL() { return 800; }

  constructor(level) {
    this._level = level;
  }

  setLevel(level) {
    this._level = level;
  }

  debug(message, chalkColor) {
    if (this._level <= Logger.DEBUG_LEVEL) this.log(message, 'info', chalkColor);
  }

  info(message, chalkColor) {
    if (this._level <= Logger.INFO_LEVEL) this.log(message, 'info', chalkColor);
  }

  warn(message, chalkColor) {
    if (this._level <= Logger.WARN_LEVEL) this.log(message, 'warn', chalkColor);
  }

  error(message, chalkColor) {
    if (this._level <= Logger.ERROR_LEVEL) this.log(message, 'error', chalkColor);
  }

  log(message, consoleLevel, chalkColor) {
    if (chalkColor) message = chalk[chalkColor](message);
    console[consoleLevel](message); // eslint-disable-line no-console
  }
};
