/* global exports, require, lolex */
const puppeteer = require('puppeteer');
const {Logger} = require('./Logger');
const {resolveNodeModuleFile} = require('./utils');
const {performAction} = require('./perform-action');

const log = new Logger(Logger.INFO_LEVEL);

exports.Browser = class Browser {
  constructor(defaultTime, test = false) {
    this.defaultTime = defaultTime;
    this.test = test;
  }

  async launch(debug, dimensions) {
    this.browser = await puppeteer.launch(this._generateConfig(debug));
    await this.createPage();
    this._initHandlers(debug);
    this._setViewport(dimensions);
  }

  _generateConfig(debug) {
    let options = {ignoreDefaultArgs: ['--hide-scrollbars']};
    return debug ? Object.assign({}, {headless: false, slowMo: 250}, options) : options;
  }

  // will change log to output eventually 
  _initHandlers(debug) {
    if (debug) this.page.on('console', msg => log.debug(`\nCHROMIUM LOG: ${msg.text()}`));
    this.browser.on('targetchanged', async () => {
      await this._addScript("/node_modules/lolex/lolex.js");
      this._setBrowserDate();
    });
  }

  async _addScript(pathToUse) {
    pathToUse = await resolveNodeModuleFile(pathToUse);
    if (this.page) {
      return this.page.addScriptTag({
        path: pathToUse
      });
    }
  }

  _setBrowserDate() {
    if (this.page) {
      return this.page.evaluateHandle(time => {
        let mockDate = lolex.createClock(time);
        window.Date = mockDate.Date;
      }, this.defaultTime);
    }
  }

  async createPage() {
    this.page = await this.browser.newPage();
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

  async performAction(action) {
    if (!this.test) return;
    //TODO: probably not great that this is added to the page on every action performed - fixme
    await this._addScript("/node_modules/query-selector-shadow-dom/dist/querySelectorShadowDom.js");
    try {
      await performAction(action, this.page, this.test);
    } catch (err) {
      return 0;
    }
    if (action.delay) await this.page.waitFor(action.delay);
    return 1;
  }

};