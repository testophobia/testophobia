/* global require, global, process, exports, module */
"use strict";
const chalk = require("chalk");
const figures = require("figures");
const loadConf = require("./load-config");
const meow = require("meow");
const {ScreenGenerator} = require("./screen-generator");
const {asyncForEach} = require("./utils");
const {serveViewer} = require("./serve-viewer");
const glob = require("glob");
const path = require("path");
const esm = require("esm");
const rimraf = require("rimraf");
const fs = require("fs");

global.response = 0;

exports.Testophobia = class Testophobia {
  constructor(config = {}) {
    this.config = config;
  }

  async run(testPath = false) {

    let passedConfigTests = this.config.tests || false;

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

    if (this.config.verbose) this._printWelcomeMessage();

    if (this.config.clear) {
      await this._clearDirectories();
      return global.response;
    }

    let target = testPath ? testPath : passedConfigTests ? passedConfigTests : cli.input[0] ? cli.input[0] : this.config.tests;

    let resp = await this._handleTestPaths(target, this.config.golden);

    if (resp.bailTriggered) console.log('Oh no! We hit a failure and bailed');

    if (!this.config.golden) resp.failures.length ? this._handleFailures(resp) : this._handleSuccess();

    return global.response;
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
        --clear                  Remove the generated image directories
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
              this.config.verbose || false
          },
          skipViewer: {
            type: "boolean",
            alias: "s",
            default:
              this.config &&
              this.config.skipViewer || false
          },
          bail: {
            type: "boolean",
            alias: "b",
            default:
              this.config &&
              this.config.bail || false
          },
          golden: {
            type: "boolean",
            alias: "g",
            default:
              this.config &&
              this.config.golden || false
          },
          clear: {
            type: "boolean",
            default:
              this.config &&
              this.config.clear || false
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
    global.response = 1;
  }

  _throwFileError() {
    return this._exit("No test files found! Check your config or input path.");
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

  async _handleTestPaths(target, isGolden) {
    if (typeof(target) === "undefined") return this._throwFileError();
    let testPaths = [];
    if (typeof target === "object" && target.filter(t => Object.keys(t).includes('name')).length) return this._executeTests(isGolden, this.config.tests);
    typeof target === "string" ? testPaths = await glob.sync(target) : await asyncForEach(target, async t => {
      let tp = await glob.sync(t);
      tp.forEach(t => testPaths.push(t));
    });
    if (!testPaths.length) {
      testPaths = await this.config.tests && Array.isArray(this.config.tests) ? this.config.tests.filter(t => t.name && t.name === target) : [];
      return testPaths.length ? this._executeTests(isGolden, testPaths) : this._throwFileError();
    }
    return this._populateAndRunTests(testPaths, isGolden);
  }

  async _populateAndRunTests(testPaths, goldenTest) {
    let tests = [];
    await asyncForEach(testPaths, t => {
      let file = esm(module, {
        cjs: false,
        force: true,
        mode: "all"
      })(path.join(process.cwd(), t));
      if (file.default) tests.push(file.default);
    });
    return tests.length ? this._executeTests(goldenTest, tests) : this._throwFileError();
  }

  async _executeTests(goldenTest, tests) {
    const sg = new ScreenGenerator(this.config, goldenTest, tests);
    let resp = await sg.run();
    return resp;
  }

  async _handleFailures(resp) {
    await this._createResultFile(resp);
    this._displayErrorDetails(resp.failures);
    this.launchViewer();
  }

  _handleSuccess() {
    console.log('all tests pass!');
  }

  _createResultFile({tests, failures}) {
    this.resultFile = `${this.config.diffDirectory}/results.json`;
    fs.createWriteStream(this.resultFile);
    this.results = {
      tests: tests,
      date: Date.now(),
      quality: this.config.quality || 80,
      threshold: this.config.threshold || 0.2,
      baseUrl: this.config.baseUrl || "http://localhost:6789",
      screenTypes: this.config.dimensions || "coming",
      failures: failures
    };
    fs.appendFileSync(this.resultFile, JSON.stringify(this.results), err => {
      if (err) console.log("There was an error adding info to the JSON file");
    });
  }

  _displayErrorDetails(failures) {
    failures.forEach(f => {
      console.log(
        chalk.red(
          `${f.test} ${f.screenType} Pixel Difference: ${f.pixelDifference}\n`
        )
      );
      console.log(
        ` - Diff file location: ` + f.diffFileLocation
      );
    });
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