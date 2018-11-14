/* global __dirname, require, process, exports */
'use strict';
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const puppeteerUserDataDir = require('puppeteer-extra-plugin-user-data-dir');
const puppeteerUserPrefs = require('puppeteer-extra-plugin-user-preferences');
const express = require('express');
const app = express();
const {performAction} = require('../lib/perform-action');
const {loadConfig} = require('../lib/load-config');
const {resolveNodeModuleFile} = require('../lib/utils');

exports.TestophobiaRecorder = class TestophobiaRecorder {
  async launch() {
    let baseUrl = 'https://www.google.com';
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

    //add handler to perform recorder actions thru puppeteer
    app.post('/performAction/:actionString', async (req, res) => {
      //to make sure our shadow dom lib is always loaded, even when navigating, we'll remove it if it exists and re-add
      await page.evaluate(() =>{
        let scripts = document.querySelectorAll('script');
        for (let i = 0; i < scripts.length; i++) {
          if (scripts[i].innerHTML.indexOf('querySelectorShadowDom') >= 0)
            scripts[i].parentNode.removeChild(scripts[i]);
        }
      });
      await page.addScriptTag({path:resolveNodeModuleFile('/node_modules/query-selector-shadow-dom/dist/querySelectorShadowDom.js')});
      let action = JSON.parse(decodeURIComponent(req.params.actionString));
      action.target = action.target.replace(/\s&gt;/g, '');
      try {
        performAction(action, page, {});
      } catch(e) {
        if (!e.message.contains('Unable to move mouse')) {
          console.log(e);
        }
      }
      res.sendStatus(200);
    });
    app.get('/tests', (req, res) => {
      let results = '';
      const tDir = `${process.cwd()}/testophobia/tests`;
      if (fs.existsSync(tDir)) {
        const getAllFiles = dir => fs.readdirSync(dir).reduce((files, file) => {
          const name = path.join(dir, file);
          const isDirectory = fs.statSync(name).isDirectory();
          return isDirectory ? [...files, ...getAllFiles(name)] : [...files, path.relative(tDir, name)];
        }, []);
        results = getAllFiles(tDir);
      }
      res.header('Content-Type', 'application/json');
      res.send(JSON.stringify(results));
    });
    app.listen(8091);
  }
};