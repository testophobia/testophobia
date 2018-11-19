/* global require, exports, process */
const {loadConfig, configDefaults} = require('./load-config');
const meow = require('meow');
const fs = require('fs');
const chalk = require('chalk');

exports.Configuration = class Configuration {

  static get target() {return this.target;}

  static get config() {return this.config;}

  constructor(config = {}) {
    this.config = config;
    this._configure();
  }

  _configure() {
    this.passedConfigTests = this.config.tests || false;
    let confError = null;
    this.cli = this._configureCliCommands(this.config);
    try {
      this.config = Object.assign(loadConfig(this.config), this.cli.flags);
    } catch (error) {
      confError = error;
    }
    if (confError) {
      if (confError.parent) {
        this._exit(`${confError.message}\n${chalk.gray((confError.parent && confError.parent.stack) || confError.parent)}`);
      } else {
        this._exit(confError.message);
      }
    }
    if (this.config.init) this._generateConfigFile();
    this.target = this.passedConfigTests ? this.passedConfigTests : this.cli.input[0] ? this.cli.input[0] : this.config.tests;
  }

  _configureCliCommands() {
    return meow(
      `
      Usage
        testophobia [<file|directory|glob> ...]
      Options
        --golden, -g             Produce golden images instead of test images
        --bail, -b               Exit on first test failure
        --verbose, -v            Enable verbose output
        --skip-viewer, -s        Prevent viewer auto-launch
        --clear, -c              Remove the generated image directories
        --init, -i               Generate a default config file and exit
      Examples
        testophobia
        testophobia test/**/*.js
    `,
      {
        flags: {
          verbose: {
            type: 'boolean',
            alias: 'v',
            default: this.config && this.config.verbose || false
          },
          skipViewer: {
            type: 'boolean',
            alias: 's',
            default: this.config && this.config.skipViewer || false
          },
          bail: {
            type: 'boolean',
            alias: 'b',
            default: this.config && this.config.bail || false
          },
          golden: {
            type: 'boolean',
            alias: 'g',
            default: this.config && this.config.golden || false
          },
          clear: {
            type: 'boolean',
            alias: 'c',
            default: this.config && this.config.clear || false
          },
          init: {
            type: 'boolean',
            alias: 'i',
            default: this.config && this.config.init || false
          },
          debug: {
            type: 'boolean',
            alias: 'd',
            default: this.config && this.config.debug || false
          },
          '--': {
            type: 'string'
          }
        }
      }
    );
  }

  _generateConfigFile() {
    try {
      fs.accessSync('testophobia.config.js');
    } catch (e) {
      const defaults = configDefaults;
      defaults.tests = [{name: 'home', path: null, delay: null, actions: []}];
      const contents = `export default ${JSON.stringify(defaults, null, 2)};`;
      fs.writeFileSync('testophobia.config.js', contents, (err) => {if (err) throw err;});
    }
    process.exit(0); // eslint-disable-line no-process-exit
  }
};