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
        --version, -v                   Show installed version number
        --golden, -g                    Produce golden images instead of test images
        --browser, -w                   Override the browser <chromium|firefox|webkit>
        --init, -i                      Generate a default config file and exit
        --max-parallel [num], -p [num]  The maximum number of tests to run concurrently (default = 1)
        --skip-viewer, -s               Prevent viewer auto-launch
        --keep-failures, -k             Keep previous failures for this test run
        --write-xml, -x                 Write out a junit formatted xml file for CI display
        --bail, -b                      Exit on first test failure
        --verbose, -o                   Enable verbose output
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
          version: {
            type: 'boolean',
            shortFlag: 'v',
            default: false
          },
          verbose: {
            type: 'boolean',
            shortFlag: 'o',
            default: false
          },
          browser: {
            type: 'string',
            shortFlag: 'w'
          },
          skipViewer: {
            type: 'boolean',
            shortFlag: 's',
            default: false
          },
          keepFailures: {
            type: 'boolean',
            shortFlag: 'k',
            default: false
          },
          writeXml: {
            type: 'boolean',
            shortFlag: 'x',
            default: false
          },
          bail: {
            type: 'boolean',
            shortFlag: 'b',
            default: false
          },
          golden: {
            type: 'boolean',
            shortFlag: 'g',
            default: false
          },
          clear: {
            type: 'boolean',
            shortFlag: 'c',
            default: false
          },
          statistics: {
            type: 'boolean',
            shortFlag: 'n',
            default: false
          },
          init: {
            type: 'boolean',
            shortFlag: 'i',
            default: false
          },
          debug: {
            type: 'boolean',
            shortFlag: 'd',
            default: false
          },
          logOutput: {
            type: 'boolean',
            shortFlag: 'l',
            default: false
          },
          maxParallel: {
            type: 'string',
            shortFlag: 'p'
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
            shortFlag: 'v',
            default: false
          },
          golden: {
            type: 'boolean',
            shortFlag: 'g',
            default: false
          },
          browser: {
            type: 'string',
            shortFlag: 'w'
          },
          '--': {
            type: 'string'
          }
        }
      }
    );
  }
};
