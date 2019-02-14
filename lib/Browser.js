/* global exports, require, __dirname */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const {Logger} = require('./Logger');
const {resolveNodeModuleFile} = require('./utils');
const {performAction} = require('./utils/perform-action');

const log = new Logger(Logger.INFO_LEVEL);

exports.Browser = class Browser {
  async launch(options) {
    if (!options) return 0;
    this.browser = await puppeteer.launch(this._generateConfig(options.debug));
    this.baseDelay = options.baseDelay || false;
    await this.createPage();
    this._initHandlers(options.debug, options.defaultTime);
    this._setViewport(options.dimensions);
  }

  _generateConfig(debug = false) {
    let options = {ignoreDefaultArgs: ['--hide-scrollbars']};
    return debug ? Object.assign({}, {headless: false, slowMo: 250}, options) : options;
  }

  async _initHandlers(debug, defaultTime) {
    if (debug) this.page.on('console', msg => log.debug(`\nCHROMIUM LOG: ${msg.text()}`));
    const lolex = this._getLolex();
    await this.page.evaluateOnNewDocument(`
      ${lolex}
      let mockDate = lolex.createClock(${defaultTime});
      window.Date = mockDate.Date;
      window.Testophobia = {};
    `);
  }

  async _addScript(pathToUse) {
    pathToUse = await resolveNodeModuleFile(pathToUse);
    if (this.page) {
      return this.page.addScriptTag({
        path: pathToUse
      });
    }
  }

  async createPage() {
    this.page = await this.browser.newPage();
  }

  _getLolex() {
    let lolexPath;
    if (__dirname.indexOf('node_modules') > 0) {
      lolexPath = '../../lolex/lolex.js';
    } else {
      lolexPath = '../node_modules/lolex/lolex.js';
    }
    return fs.readFileSync(path.resolve(__dirname, lolexPath), 'utf8');
  }

  _setViewport(d) {
    return this.page.setViewport(d);
  }

  close() {
    return this.browser.close();
  }

  async goto(url) {
    await this.page.goto(url, {waitUntil: 'networkidle0'});
  }

  async screenshot(options) {
    await this.page.screenshot(options);
  }

  async performAction(action, test) {
    if (!test) return;
    //TODO: probably not great that this is added to the page on every action performed - fixme
    await this._addScript("/node_modules/query-selector-shadow-dom/dist/querySelectorShadowDom.js");
    try {
      await performAction(action, this.page, test);
    } catch (err) {
      return 0;
    }
    let delay = action.delay || this.baseDelay;
    if (delay) await this.page.waitFor(delay);
    return 1;
  }

};