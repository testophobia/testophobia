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

exports.run = async config => {
  let confError = null;
  try {
    global.conf = Object.assign({}, loadConf(), config);
  } catch (error) {
    confError = error;
  }

  const cli = _configureCliCommands(config);

  if (confError) {
    if (confError.parent) {
      _exit(
        `${confError.message}\n\n${chalk.gray(
          (confError.parent && confError.parent.stack) || confError.parent
        )}`
      );
    } else {
      _exit(confError.message);
    }
  }

  let useRoutes = _getRoutes(cli);

  if (!useRoutes) _throwFileError();

  if (cli.flags.verbose) _printWelcomeMessage();

  if (cli.flags.clear) {
    await _clearDirectories();
    return global.response;
  }

  global.conf = Object.assign({}, global.conf, cli.flags);

  cli.flags.usePath ? _handlePathRoutes(cli, cli.flags.golden, config) :
    _executeTests(cli.flags.golden, useRoutes, config);

  return global.response;

};

const _configureCliCommands = config => meow(
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
          global.conf &&
          global.conf.hasOwnProperty("verbose") &&
          global.conf.verbose
      },
      skipViewer: {
        type: "boolean",
        alias: "s",
        default:
          global.conf &&
          global.conf.hasOwnProperty("skipViewer") &&
          global.conf.skipViewer
      },
      golden: {
        type: "boolean",
        alias: "g",
        default:
          (config && config.hasOwnProperty("golden")) ||
          global.conf && global.conf.hasOwnProperty("golden") && global.conf.golden
      },
      usePath: {
        type: "boolean",
        alias: "p",
        default:
          global.conf &&
          global.conf.hasOwnProperty("usePath") &&
          global.conf.usePath
      },
      clear: {
        type: "boolean",
        default:
          global.conf &&
          global.conf.hasOwnProperty("clear") &&
          global.conf.clear
      },
      "--": {
        type: "string"
      }
    }
  }
);

const _exit = message => {
  console.error(`\n${chalk.red(figures.cross)} ${message}`);
  process.exit(1); // eslint-disable-line no-process-exit
};

const _getRoutes = cli => cli.input.length > 0
  ? cli.input.map(r => ({name: r}))
  : global.conf.hasOwnProperty("routes")
    ? global.conf.routes
    : false;

const _throwFileError = () => {
  global.response = 1;
  throw new Error(chalk.red("No file arguments found!"));
};

//TODO: Display routes
const _printWelcomeMessage = () => {
  console.log(chalk.cyan("😱  Testophobia Running ...\n"));
};

const _clearDirectories = () => Promise.all([
  _deleteDirectory(global.conf.goldenDirectory),
  _deleteDirectory(global.conf.diffDirectory),
  _deleteDirectory(global.conf.testDirectory)
]).then(() => console.log("Testophobia Screenshot Directories Cleared.\n"));

const _deleteDirectory = directory => new Promise(resolve => rimraf(directory, resolve));

const _handlePathRoutes = (cli, goldenTest, config) => {
  let routes = [];
  if (!cli.input.length) _throwFileError();
  cli.input[0].split(" ").forEach(r => glob(r, async (er, files) => {
    if (er) throw new Error(er);
    await asyncForEach(files, f => {
      let file = esm(module, {
        cjs: false,
        force: true,
        mode: "all"
      })(path.join(process.cwd(), f));
      routes.push(file.default);
    });
    _executeTests(goldenTest, routes, config);
  }));
};

const _executeTests = async (goldenTest, routes) => {
  const sg = new ScreenGenerator(goldenTest, routes);
  await sg.run();
  if (!goldenTest) {
    const sc = new ScreenCompare(routes);
    const failed = await sc.run();
    if (failed && !global.conf.skipViewer) _launchViewer();
  }
};

const _launchViewer = () => {
  const resultsFilePath = (global.conf.diffDirectory || "./testophobia/diffs") + "/results.json";

  console.log(chalk.cyan("😱  Testophobia Viewer served on port 8090"));

  if (global.conf.verbose) {
    console.log(chalk.dim(`using results file: ${resultsFilePath}`));
  }
  serveViewer(global.conf, resultsFilePath);
};
