/* global __dirname, require, process, exports */
'use strict';
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const {performAction} = require('../../lib/perform-action');
const {loadConfig} = require('../../lib/load-config');

exports.TestophobiaRecorder = class TestophobiaRecorder {
  async launch() {
    let baseUrl = 'about:blank';
    let defWidth = 1024;
    let defHeight = 768;
    if (fs.existsSync(`${process.cwd()}/testophobia.config.js`)) {
      let config = loadConfig();
      baseUrl = config.baseUrl;
      if (config.dimensions && config.dimensions.length) {
        defWidth = config.dimensions[0].width;
        defHeight = config.dimensions[0].height;
      }
    }

    const args = puppeteer.defaultArgs().filter(arg => {
      switch (String(arg).toLowerCase()) {
        case '--disable-extensions':
        case '--headless':
          return false;
        default:
          return true;
      }
    });

    args.pop();
    args.push(baseUrl);

    const browser = await puppeteer.launch({
      ignoreDefaultArgs: true,
      args: args.concat([
        '--auto-open-devtools-for-tabs',
        `--load-extension=${__dirname}/extension`,
        `--window-size=${defWidth},${defHeight}`
      ])
    });

    let pagelist = await browser.pages();
    let page = pagelist[0];
    await page.addScriptTag({path:path.join(__dirname, '../../node_modules/query-selector-shadow-dom/dist/querySelectorShadowDom.js')});

    app.post('/performAction/:actionString', (req, res) => {
      let action = JSON.parse(decodeURIComponent(req.params.actionString));
      action.target = action.target.replace(/\s&gt;/g, '');
      performAction(action, page, {});
      res.sendStatus(200);
    });

    app.listen(8091);
  }
};