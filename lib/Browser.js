/* global exports, require, __dirname */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const {Logger} = require('./Logger');
const {resolveNodeModuleFile} = require('./utils');
const {performAction} = require('./utils/perform-action');

process.setMaxListeners(Infinity);

const log = new Logger(Logger.INFO_LEVEL);

exports.Browser = class Browser {
  constructor(runnerId) {
    this.runnerId = runnerId;
  }

  async launch(options) {
    if (!options) return 0;
    try {
      this.browser = await puppeteer.launch(this._generateConfig(options.debug));
      this.baseDelay = options.baseDelay || false;
      this.delayModifier = options.delayModifier || 1;
      this.pageLoadMax = options.pageLoadMax;
      await this.createPage();
      this._initHandlers(options.debug, options.defaultTime);
      this._setViewport(options.dimensions);
    } catch (err) {
      this.close();
    }
  }

  _generateConfig(debug = false) {
    let options = {ignoreDefaultArgs: ['--hide-scrollbars']};
    return debug ? Object.assign({}, {headless: false, slowMo: 250}, options) : options;
  }

  async _initHandlers(debug, defaultTime) {
    if (debug) this.page.on('console', msg => log.debug(`\nCHROMIUM LOG: ${msg.text()}`));
    const lolex = this._getLolex();
    /* istanbul ignore next */
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
    this.page.setExtraHTTPHeaders({
      testophobiaId: this.runnerId.toString()
    });
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
    return this.browser ? this.browser.close() : false;
  }

  async goto(url) {
    if (this.pageLoadMax) {
      await Promise.race([this.page.goto(url, {waitUntil: 'networkidle2'}), new Promise(x => setTimeout(x, this.pageLoadMax).unref())]);
    } else {
      await this.page.goto(url, {waitUntil: 'networkidle2'});
    }
  }

  async screenshot(options) {
    await this.page.screenshot(options);
  }

  async performAction(action, test) {
    if (!test) return;
    //TODO: probably not great that this is added to the page on every action performed - fixme
    await this._addScript('/node_modules/query-selector-shadow-dom/dist/querySelectorShadowDom.js');
    try {
      await performAction(action, this.page, test);
    } catch (err) {
      console.error(err);
      return 0;
    }
    let delay = action.delay || this.baseDelay;
    delay = delay * this.delayModifier;
    if (delay) await this.page.waitFor(delay);
    return 1;
  }
};
