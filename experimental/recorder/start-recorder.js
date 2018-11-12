/* global __dirname, require */
const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const {performAction} = require('../../lib/perform-action');

(async () => {
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
  args.push('http://localhost:3000/index.html');
  const browser = await puppeteer.launch({
    ignoreDefaultArgs: true,
    args: args.concat([
      '--auto-open-devtools-for-tabs',
      `--load-extension=${__dirname}/extension`
    ])
  });

  let pagelist = await browser.pages();
  let page = pagelist[0];
  await page.addScriptTag({path:'../../node_modules/query-selector-shadow-dom/dist/querySelectorShadowDom.js'});

  app.post('/performAction/:actionString', (req, res) => {
    let action = JSON.parse(decodeURIComponent(req.params.actionString));
    action.target = action.target.replace(/\s&gt;/g, '');
    performAction(action, page, {});
    res.sendStatus(200);
  });

  app.listen(8091);
})();