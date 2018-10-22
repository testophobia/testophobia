/* global require, global, process, exports, module */
"use strict";
const chalk = require("chalk");
const figures = require("figures");
const loadConf = require("./load-config");
const meow = require("meow");
const {ScreenGenerator} = require("./screen-generator");
const {ScreenCompare} = require("./screen-compare");
const {asyncForEach} = require("./utils/get-date");
const {serveViewer} = require("./serve-viewer");
const glob = require("glob");
const path = require("path");
const esm = require("esm");
const rimraf = require("rimraf");

global.response = 0;

exports.Testophobia = class Testophobia {
  constructor(config = {}) {
    this.config = config;
  }

  async run() {
    let confError = null;

    const cli = this._configureCliCommands();

    try {
      this.config = Object.assign(this.config, loadConf(), cli.flags);
    } catch (error) {
      confError = error;
    }

    if (confError) {
      if (confError.parent) {
        this._exit(
          `${confError.message}\n\n${chalk.gray(
            (confError.parent && confError.parent.stack) || confError.parent
          )}`
        );
      } else {
        this._exit(confError.message);
      }
    }

    let tests = this._getTests(cli);

    if (!tests) this._throwFileError();

    if (cli.flags.verbose) this._printWelcomeMessage();

    if (cli.flags.clear) {
      await this._clearDirectories();
      return global.response;
    }

    await cli.flags.usePath ? this._handleTestPaths(cli, cli.flags.golden) :
      this._executeTests(cli.flags.golden, tests);

    return global.response;
  }

  _configureCliCommands() {
    return meow(
      `
      Usage
        testophobia [<file|directory|glob> ...]
      Options
        --verbose, -v           Enable verbose output
        --skip-viewer, -s         Prevent viewer auto-launch
      Examples
        testophobia
        testophobia test/**/*.js
    `,
      {
        flags: {
          verbose: {
            type: "boolean",
            alias: "v",
            default:
              this.config &&
              this.config.hasOwnProperty("verbose") &&
              this.config.verbose
          },
          skipViewer: {
            type: "boolean",
            alias: "s",
            default:
              this.config &&
              this.config.hasOwnProperty("skipViewer") &&
              this.config.skipViewer
          },
          golden: {
            type: "boolean",
            alias: "g",
            default:
              this.config && this.config.hasOwnProperty("golden") && this.config.golden
          },
          usePath: {
            type: "boolean",
            alias: "p",
            default:
              this.config &&
              this.config.hasOwnProperty("usePath") &&
              this.config.usePath
          },
          clear: {
            type: "boolean",
            default:
              this.config &&
              this.config.hasOwnProperty("clear") &&
              this.config.clear
          },
          "--": {
            type: "string"
          }
        }
      }
    );
  }

  _exit(message) {
    console.error(`\n${chalk.red(figures.cross)} ${message}`);
    process.exit(1); // eslint-disable-line no-process-exit
  }

  //TODO Fix for mocha 
  _getTests(cli) {
    return cli.input.length > 0
      ? cli.input.map(r => ({name: r}))
      : this.config.hasOwnProperty("tests")
        ? this.config.tests
        : false;
  }

  _throwFileError() {
    global.response = 1;
    throw new Error(chalk.red("No file arguments found!"));
  }

  //TODO: Display tests
  _printWelcomeMessage() {
    console.log(chalk.cyan("😱  Testophobia Running ...\n"));
  }

  _clearDirectories() {
    return Promise.all([
      this._deleteDirectory(this.config.goldenDirectory),
      this._deleteDirectory(this.config.diffDirectory),
      this._deleteDirectory(this.config.testDirectory)
    ]).then(() => console.log("Testophobia Screenshot Directories Cleared.\n"));
  }

  _deleteDirectory(directory) {
    return new Promise(resolve => rimraf(directory, resolve));
  }

  _handleTestPaths(cli, goldenTest) {
    let tests = [];
    if (!cli.input.length) this._throwFileError();
    cli.input[0].split(" ").forEach(r => glob(r, async (er, files) => {
      if (er) throw new Error(er);
      await asyncForEach(files, f => {
        let file = esm(module, {
          cjs: false,
          force: true,
          mode: "all"
        })(path.join(process.cwd(), f));
        tests.push(file.default);
      });
      this._executeTests(goldenTest, tests);
    }));
  }

  async _executeTests(goldenTest, tests) {
    const sg = new ScreenGenerator(this.config, goldenTest, tests);
    await sg.run();
    if (!goldenTest) {
      const sc = new ScreenCompare(this.config, tests);
      const failed = await sc.run();
      if (failed && !this.config.skipViewer) this.launchViewer();
    }
  }

  launchViewer() {
    const resultsFilePath = (this.config.diffDirectory || "./testophobia/diffs") + "/results.json";

    console.log(chalk.cyan("😱  Testophobia Viewer served on port 8090"));

    if (this.config.verbose) {
      console.log(chalk.dim(`using results file: ${resultsFilePath}`));
    }
    serveViewer(this.config, resultsFilePath);
  }

};