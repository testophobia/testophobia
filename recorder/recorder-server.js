/* global require, process, exports, module */
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const odiff = require('deep-object-diff').diff;
const esm = require('esm');
const mkdirp = require('mkdirp');
const express = require('express');
const bodyParser = require('body-parser');
const {performAction} = require('../lib/utils/perform-action');
const {resolveNodeModuleFile} = require('../lib/utils');

const app = express();
app.use(bodyParser.text({}));

exports.RecorderServer = {
  start: (config, page) => {
    let baseUrl = config.baseUrl;
    let testsGlob = config.tests;

    //add handler to retrieve the top-level configs
    app.get('/config', (req, res) => {
      res.header('Content-Type', 'application/json');
      res.send(JSON.stringify(config));
    });

    //add handler to save a the config file
    app.post('/config', (req, res) => {
      let json = JSON.parse(req.body);
      const diffs = odiff(config, json);
      let current = esm(module, {cjs: false, force: true, mode: 'all'})(path.join(process.cwd(), 'testophobia.config.js')).default;
      Object.keys(diffs).forEach(k => current[k] = diffs[k]);
      current = JSON.stringify(current, null, 2);
      const cfgFile = path.join(process.cwd(), 'testophobia.config.js');
      fs.writeFileSync(cfgFile, `export default ${current};`);
      config = json;
      baseUrl = json.baseUrl;
      testsGlob = json.tests;
      res.sendStatus(200);
    });

    //add handler to perform recorder actions thru puppeteer
    app.post('/performAction/:actionString', async (req, res) => {
      //to make sure our shadow dom lib is always loaded, even when navigating, we'll remove it if it exists and re-add
      await page.evaluate(() => {
        let scripts = document.querySelectorAll('script');
        for (let i = 0; i < scripts.length; i++) {
          if (scripts[i].innerHTML.indexOf('querySelectorShadowDom') >= 0)
            scripts[i].parentNode.removeChild(scripts[i]);
        }
      });
      await page.addScriptTag({path: resolveNodeModuleFile('/node_modules/query-selector-shadow-dom/dist/querySelectorShadowDom.js')});
      let action = JSON.parse(decodeURIComponent(req.params.actionString));
      action.target = action.target.replace(/\s&gt;/g, '');
      try {
        performAction(action, page, {});
      } catch (e) {
        if (!e.message.contains('Unable to move mouse')) {
          console.log(e);
        }
      }
      res.sendStatus(200);
    });

    //add handler to retrieve the list of available tests
    app.get('/tests', async (req, res) => {
      let results;
      if (Array.isArray(testsGlob)) {
        results = Array.apply(null, Array(testsGlob.length));
        results = results.map((x, i) => 'inline-test-' + i);
      } else {
        results = await glob.sync(testsGlob);
      }
      res.header('Content-Type', 'application/json');
      res.send(JSON.stringify(results));
    });

    //add handler to navigate the browser to a test's route
    app.post('/navigate/:testRoute', (req, res) => {
      const url = `${baseUrl}${decodeURIComponent(req.params.testRoute)}`;
      if (page.url() !== url) page.goto(url);
      res.sendStatus(200);
    });

    //add handler to retrieve a single test definition
    app.get('/test/:testPath', (req, res) => {
      res.header('Content-Type', 'application/json');
      if (req.params.testPath.indexOf('inline-test-') === 0) {
        const testIdx = req.params.testPath.substr(12);
        res.send(testsGlob[parseInt(testIdx)]);
      } else {
        const file = esm(module, {cjs: false, force: true, mode: 'all'})(path.join(process.cwd(), decodeURIComponent(req.params.testPath)));
        res.send(JSON.stringify(file.default || {}));
      }
    });

    //add handler to save a single test definition
    app.post('/test/:testPath', (req, res) => {
      //TODO - saving inline tests?
      let json = JSON.parse(req.body);
      json = JSON.stringify(json, null, 2);
      const testFile = path.join(process.cwd(), decodeURIComponent(req.params.testPath));
      if (!fs.existsSync(path.dirname(testFile))) mkdirp.sync(path.dirname(testFile));
      fs.writeFileSync(testFile, `export default ${json};`);
      res.sendStatus(200);
    });

    //start the server
    app.listen(8091);
  }
};