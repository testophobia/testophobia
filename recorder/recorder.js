/* global __dirname, require, process, exports */
'use strict';
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const puppeteerUserDataDir = require('puppeteer-extra-plugin-user-data-dir');
const puppeteerUserPrefs = require('puppeteer-extra-plugin-user-preferences');
const {loadConfig} = require('../lib/load-config');
const {RecorderServer} = require('./recorder-server');

exports.TestophobiaRecorder = class TestophobiaRecorder {
  async launch() {
    let baseUrl = 'about:blank';
    let defWidth = 1024;
    let defHeight = 768;

    //if we can find a testophobia config, use the baseUrl and dimensions
    if (fs.existsSync(`${process.cwd()}/testophobia.config.js`)) {
      let config = loadConfig();
      baseUrl = config.baseUrl;
      if (config.dimensions && config.dimensions.length) {
        defWidth = config.dimensions[0].width;
        defHeight = config.dimensions[0].height;
      }
    }

    //use puppeteer-extras to inject custom user prefs
    const userDataDirPlugin = puppeteerUserDataDir({});
    puppeteer.use(userDataDirPlugin);
    await userDataDirPlugin.makeTemporaryDirectory();
    const userDataDir = userDataDirPlugin._userDataDir;
    const userPrefsPlugin = puppeteerUserPrefs({
      userPrefs: {
        devtools: {
          preferences: {
            cacheDisabled: "true",
            currentDockState: "\"undocked\"",
            elementsPanelSplitViewState: "{\"vertical\":{\"size\":600}}",
            "panel-selectedTab": "\"elements\"",
            uiTheme: "\"dark\""
          }
        }
      }
    });

    //override default args to enable extensions
    puppeteer.use(userPrefsPlugin);
    const args = puppeteer.defaultArgs().filter(arg => {
      switch (String(arg).toLowerCase()) {
        case '--disable-extensions':
        case '--headless':
          return false;
        default:
          return true;
      }
    });

    //launch puppeteer
    const browser = await puppeteer.launch({
      ignoreDefaultArgs: true,
      args: args.concat([
        '--auto-open-devtools-for-tabs',
        `--load-extension=${__dirname}/extension`,
        `--window-size=${defWidth},${defHeight}`,
        `--user-data-dir=${userDataDir}`
      ]),
      userDataDir: userDataDir,
      defaultViewport: null
    });

    //close the initial blank tab and open a fresh tab
    let pagelist = await browser.pages();
    pagelist[0].close();
    const page = await browser.newPage();
    await page.goto(baseUrl, {waitUntil: 'networkidle0'});

    //start the server
    RecorderServer.start(baseUrl, page);
  }
};