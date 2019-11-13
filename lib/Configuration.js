/* global require, exports */
const {loadConfig, loadUserConfig} = require('./utils/config/load-config');
const meow = require('meow');

/**
 * @class Consolidates config values from files and command line parameters
 */
exports.Configuration = class Configuration {
  static get config() {
    return this.config;
  }

  /**
   * Creates an instance of Configuration
   *
   * @constructor
   * @param {boolean} viewer Are we configuring the Testophobia Viewer?
   * @param {string} cfgDirectory Alternative directory to use for the config file
   */
  constructor(viewer, cfgDirectory) {
    this.cfgDirectory = cfgDirectory;
    this._init(viewer);
  }

  _init(viewer) {
    this.cli = viewer ? this._configureViewerCommands() : this._configureCliCommands();
    this.config = {};
    try {
      this.config = Object.assign(loadConfig(this.cfgDirectory), loadUserConfig());
    } catch (error) {
      this.err = error;
    }
    this.config = Object.assign(this.config, this.cli.flags);
    const cliInput = this.cli.input[0] && this.cli.input[0] !== 'undefined' ? this.cli.input[0] : null;
    this.config.tests = cliInput ? cliInput : this.config.tests;
    this.pathArg = cliInput || false;
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
            default: false
          },
          skipViewer: {
            type: 'boolean',
            alias: 's',
            default: false
          },
          writeXml: {
            type: 'boolean',
            alias: 'x',
            default: false
          },
          bail: {
            type: 'boolean',
            alias: 'b',
            default: false
          },
          golden: {
            type: 'boolean',
            alias: 'g',
            default: false
          },
          clear: {
            type: 'boolean',
            alias: 'c',
            default: false
          },
          init: {
            type: 'boolean',
            alias: 'i',
            default: false
          },
          debug: {
            type: 'boolean',
            alias: 'd',
            default: false
          },
          logOutput: {
            type: 'boolean',
            alias: 'l',
            default: false
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
            default: false
          },
          golden: {
            type: 'boolean',
            alias: 'g',
            default: false
          },
          '--': {
            type: 'string'
          }
        }
      }
    );
  }
};
