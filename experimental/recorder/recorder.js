/* global __dirname, require, process, exports */
'use strict';
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const puppeteerUserDataDir = require('puppeteer-extra-plugin-user-data-dir');
const puppeteerUserPrefs = require('puppeteer-extra-plugin-user-preferences');
const express = require('express');
const app = express();
const {performAction} = require('../../lib/perform-action');
const {loadConfig} = require('../../lib/load-config');

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
            Inspector: {
              drawerSplitViewState: "{\"horizontal\":{\"size\":477.2000060081482,\"showMode\":\"OnlyMain\"}}"
            },
            InspectorView: {
              splitViewState: "{\"vertical\":{\"size\":0},\"horizontal\":{\"size\":0}}",
            },
            cacheDisabled: "true",
            currentDockState: "\"undocked\"",
            elementsPanelSplitViewState: "{\"vertical\":{\"size\":419.6000020503998}}",
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

    //instead of always starting with an empty tab, optionally start at the baseUrl from the testophobia configs
    args.pop();
    args.push(baseUrl);

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
    let pagelist = await browser.pages();
    let page = pagelist[0];

    //inject the shadow dom query library
    await page.addScriptTag({path:path.join(__dirname, '../../node_modules/query-selector-shadow-dom/dist/querySelectorShadowDom.js')});

    //add handler to perform recorder actions thru puppeteer
    app.post('/performAction/:actionString', (req, res) => {
      let action = JSON.parse(decodeURIComponent(req.params.actionString));
      action.target = action.target.replace(/\s&gt;/g, '');
      performAction(action, page, {});
      res.sendStatus(200);
    });
    app.listen(8091);
  }
};