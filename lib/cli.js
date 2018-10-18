/* global require, global, process, exports */
"use strict";
const chalk = require("chalk");
const figures = require("figures");
const loadConf = require("./load-config");
const meow = require("meow");
const {ScreenGenerator} = require("./screen-generator");
const {ScreenCompare} = require("./screen-compare");
const {getDate} = require("./utils/get-date");
const {serveViewer} = require("./serve-viewer");

function exit(message) {
  console.error(`\n${chalk.red(figures.cross)} ${message}`);
  process.exit(1); // eslint-disable-line no-process-exit
}

global.response = 0;

exports.run = async config => {
  let confError = null;
  try {
    global.conf = Object.assign({}, loadConf(), config);
  } catch (error) {
    confError = error;
  }

  const cli = meow(
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
        "--": {
          type: "string"
        }
      }
    }
  );

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

  const testRoutes =
    cli.input.length > 0 && !global.conf.routes
      ? cli.input
      : global.conf.hasOwnProperty("routes")
        ? global.conf.routes.map(f => f.name)
        : false;

  if (!testRoutes) {
    global.response = 1;
    throw new Error(chalk.red("No file arguments found!"));
  }

  const goldenTest =
    (config && config.hasOwnProperty("golden")) ||
    cli.flags.hasOwnProperty("golden");

  global.conf = Object.assign({}, cli.flags, global.conf);

  if (global.conf.verbose) {
    console.log(chalk.cyan("😱  Testophobia Running ...\n"));
    console.log(chalk.dim(`config -----------------------------------\n`));
    console.log(chalk.dim(`Routes to test: ${testRoutes}`));
    console.log(chalk.dim(`Test Date: ${getDate()}\n`));
    console.log(chalk.dim(`------------------------------------------\n`));
  }
  const sg = new ScreenGenerator(goldenTest, testRoutes);
  await sg.run();
  if (!goldenTest) {
    const sc = new ScreenCompare(testRoutes);
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
