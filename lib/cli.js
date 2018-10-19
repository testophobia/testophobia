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
const glob = require('glob');
const path = require('path');
const esm = require('esm');

global.response = 0;

exports.run = config => {
  let confError = null;
  try {
    global.conf = Object.assign({}, loadConf(), config);
  } catch (error) {
    confError = error;
  }

  const cli = configureCliCommands(config);

  if (confError) {
    if (confError.parent) {
      exit(
        `${confError.message}\n\n${chalk.gray(
          (confError.parent && confError.parent.stack) || confError.parent
        )}`
      );
    } else {
      exit(confError.message);
    }
  }

  let useRoutes = determineRoutes(cli);

  if (!useRoutes) throwFileError();

  if (cli.flags.verbose) printWelcomeMessage();

  global.conf = Object.assign({}, global.conf, cli.flags);

  cli.flags.usePath ? handlePathRoutes(cli, cli.flags.golden, config) :
    executeTests(cli.flags.golden, useRoutes, config);

};

const configureCliCommands = config => meow(
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
      "--": {
        type: "string"
      }
    }
  }
);

const exit = message => {
  console.error(`\n${chalk.red(figures.cross)} ${message}`);
  process.exit(1); // eslint-disable-line no-process-exit
};

const determineRoutes = cli => cli.input.length > 0
  ? cli.input.map(r => ({name: r}))
  : global.conf.hasOwnProperty("routes")
    ? global.conf.routes
    : false;

const throwFileError = () => {
  global.response = 1;
  throw new Error(chalk.red("No file arguments found!"));
};

//TODO: Display routes
const printWelcomeMessage = () => {
  console.log(chalk.cyan("😱  Testophobia Running ...\n"));
};

const handlePathRoutes = (cli, goldenTest, config) => {
  let routes = [];
  if (!cli.input.length) throwFileError();
  cli.input[0].split(' ').forEach(r => glob(r, async (er, files) => {
    if (er) throw new Error(er);
    await asyncForEach(files, f => {
      let file = esm(module, {
        cjs: false,
        force: true,
        mode: "all"
      })(path.join(process.cwd(), f));
      routes.push(file.default);
    });
    executeTests(goldenTest, routes, config);
  }));
};

const executeTests = async (goldenTest, routes, config) => {
  const sg = new ScreenGenerator(goldenTest, routes);
  await sg.run();
  if (!goldenTest) {
    const sc = new ScreenCompare(routes);
    const failed = await sc.run();
    if (failed && !global.conf.skipViewer) runViewer(config);
  }
  return global.response;
};





/**********************************************************************************************************************/
/*** Launch the Viewer
/*** todo: some of this is redundant with the code above and should be factored out
/**********************************************************************************************************************/
const runViewer = config => {
  let confError = null;
  try {
    global.conf = Object.assign({}, loadConf(), config);
  } catch (error) {
    confError = error;
  }

  const cli = meow(
    `
    Usage
      testophobia-viewer [path to test results json file]
    Options
      --verbose, -v           Enable verbose output
    Examples
      testophobia-viewer
      testophobia-viewer path/to/results.json
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
        "--": {
          type: "string"
        }
      }
    }
  );

  if (confError) {
    if (confError.parent) {
      exit(
        `${confError.message}\n${chalk.gray(
          (confError.parent && confError.parent.stack) || confError.parent
        )}`
      );
    } else {
      exit(confError.message);
    }
  }

  global.conf = Object.assign({}, cli.flags, global.conf);

  const resultsFilePath = (global.conf.diffDirectory || "./testophobia/diffs") + "/results.json";

  console.log(chalk.cyan("😱  Testophobia Viewer served on port 8090"));

  if (global.conf.verbose) {
    console.log(chalk.dim(`using results file: ${resultsFilePath}`));
  }
  serveViewer(global.conf, resultsFilePath);
  return 0;
};

exports.runViewer = runViewer;
