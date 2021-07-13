import {loadConfig, loadUserConfig} from './utils/config/load-config.js';
import meow from './deps/meow.js';

/**
 * @class Consolidates config values from files and command line parameters
 */
export class Configuration {
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
  constructor(cfgDirectory) {
    this.cfgDirectory = cfgDirectory;
  }

  async init(viewer) {
    this.cli = viewer ? this._configureViewerCommands() : this._configureCliCommands();
    if (this.cli.flags.h) {
      this.cli.showHelp();
      return;
    }
    this.config = {};
    try {
      this.config = Object.assign(await loadConfig(this.cfgDirectory), await loadUserConfig());
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
        --browser, -w                   Override the browser <chromium|firefox|webkit>
        --init, -i                      Generate a default config file and exit
        --max-parallel [num], -p [num]  The maximum number of tests to run concurrently (default = 1)
        --skip-viewer, -s               Prevent viewer auto-launch
        --write-xml, -x                 Write out a junit formatted xml file for CI display
        --bail, -b                      Exit on first test failure
        --verbose, -v                   Enable verbose output
        --clear, -c                     Remove the generated image directories
        --statistics, -n                Output the test statistics only
        --log-output, -l                Logging the output rather than a terminal output
        --debug, -d                     Runs a full version of chromium and pipes browser console to the CLI
      Examples
        testophobia
        testophobia test/**/*.js
    `,
      {
        importMeta: import.meta,
        flags: {
          verbose: {
            type: 'boolean',
            alias: 'v',
            default: false
          },
          browser: {
            type: 'string',
            alias: 'w'
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
          statistics: {
            type: 'boolean',
            alias: 'n',
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
        --browser, -w              Override the browser <chromium|firefox|webkit>
        --verbose, -v              Enable verbose output
      Examples
        testophobia-viewer
        testophobia-viewer -g test/golden-screens/*.js
    `,
      {
        importMeta: import.meta,
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
          browser: {
            type: 'string',
            alias: 'w'
          },
          '--': {
            type: 'string'
          }
        }
      }
    );
  }
};
