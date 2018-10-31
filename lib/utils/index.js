/* global exports, require, process, __dirname */
const chalk = require('chalk');
const figures = require('figures');
const path = require('path');

exports.getDate = () => {
  const currentdate = new Date();
  return `${currentdate.getMonth() +
    1}-${currentdate.getDate()}-${currentdate.getFullYear()}_${currentdate.getHours()}-${currentdate.getMinutes()}-${currentdate.getSeconds()}`;
};

exports.asyncForEach = async (arr, cb) => {
  for (let i = 0; i < arr.length; i++) {
    await cb(arr[i], i, arr);
  }
};

exports.resolveNodeModulePath = () => {
  let nodeModulesPath = path.join(__dirname, '../../../');

  if (path.basename(nodeModulesPath) !== 'node_modules') {
    nodeModulesPath = path.join(__dirname, '../../node_modules/');
  }
  return nodeModulesPath;
};

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
};
