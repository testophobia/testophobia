/* global require, exports */
const {loadConfig, loadUserConfig} = require('./utils/load-config');
const meow = require('meow');

exports.Configuration = class Configuration {
  static get target() {
    return this.target;
  }

  static get config() {
    return this.config;
  }

  constructor(config = {}, viewer = false) {
    this.config = config;
    this._init(viewer);
  }

  _init(viewer) {
    let confError = null;
    this.passedConfigTests = this.config.tests || false;
    this.cli = viewer ? this._configureViewerCommands() : this._configureCliCommands();
    try {
      this.config = Object.assign(loadConfig(this.config), loadUserConfig(), this.cli.flags);
    } catch (error) {
      console.error(error);
      confError = error;
    }
    if (confError) {
      this.err = 'Unable to process config files!';
      return;
    }
    this.target = this.passedConfigTests ? this.passedConfigTests : this.cli.input[0] ? this.cli.input[0] : this.config.tests;
    this.pathArg = this.cli.input[0] || false;
    this.config.maxParallel = Number(this.config.maxParallel) || 1;
  }

  _configureCliCommands() {
    return meow(
      `
      Usage
        testophobia [<file|directory|glob> ...]
      Options
        --golden, -g                    Produce golden images instead of test images
        --init, -i                      Generate a default config file and exit
        --max-parallel [num], -p [num]  The maximum number of tests to run concurrently (default = 1)
        --skip-viewer, -s               Prevent viewer auto-launch
        --write-xml, -x                 Write out a junit formatted xml file for CI display
        --bail, -b                      Exit on first test failure
        --verbose, -v                   Enable verbose output
        --clear, -c                     Remove the generated image directories
        --log-output, -l                Logging the output rather than a terminal output
        --debug, -d                     Runs a full version of chromium and pipes browser console to the CLI
      Examples
        testophobia
        testophobia test/**/*.js
    `,
      {
        flags: {
          verbose: {
            type: 'boolean',
            alias: 'v',
            default: (this.config && this.config.verbose) || false
          },
          skipViewer: {
            type: 'boolean',
            alias: 's',
            default: (this.config && this.config.skipViewer) || false
          },
          writeXml: {
            type: 'boolean',
            alias: 'x',
            default: (this.config && this.config.writeXml) || false
          },
          bail: {
            type: 'boolean',
            alias: 'b',
            default: (this.config && this.config.bail) || false
          },
          golden: {
            type: 'boolean',
            alias: 'g',
            default: (this.config && this.config.golden) || false
          },
          clear: {
            type: 'boolean',
            alias: 'c',
            default: (this.config && this.config.clear) || false
          },
          init: {
            type: 'boolean',
            alias: 'i',
            default: (this.config && this.config.init) || false
          },
          debug: {
            type: 'boolean',
            alias: 'd',
            default: (this.config && this.config.debug) || false
          },
          logOutput: {
            type: 'boolean',
            alias: 'l',
            default: (this.config && this.config.logOutput) || false
          },
          maxParallel: {
            type: 'string',
            alias: 'p'
          },
          '--': {
            type: 'string'
          }
        }
      }
    );
  }

  _configureViewerCommands() {
    return meow(
      `
      Usage
        testophobia-viewer
      Options
        --golden, -g [directory]   View the golden images only for path
        --verbose, -v              Enable verbose output
      Examples
        testophobia-viewer
        testophobia-viewer -g test/golden-screens/*.js
    `,
      {
        flags: {
          verbose: {
            type: 'boolean',
            alias: 'v',
            default: (this.config && this.config.verbose) || false
          },
          golden: {
            type: 'boolean',
            alias: 'g',
            default: (this.config && this.config.golden) || false
          },
          '--': {
            type: 'string'
          }
        }
      }
    );
  }
};
