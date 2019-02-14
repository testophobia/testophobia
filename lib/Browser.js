/* global exports, require, lolex */
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

  _initHandlers(debug, defaultTime) {
    if (debug) this.page.on('console', msg => log.debug(`\nCHROMIUM LOG: ${msg.text()}`));
    this.browser.on('targetchanged', async () => {
      await this._addScript("/node_modules/lolex/lolex.js");
      this._setBrowserDate(defaultTime);
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

  _setBrowserDate(defaultTime) {
    if (this.page) {
      return this.page.evaluateHandle(time => {
        let mockDate = lolex.createClock(time);
        window.Date = mockDate.Date;
      }, defaultTime);
    }
  }

  async createPage() {
    this.page = await this.browser.newPage();
    await this.page.evaluateOnNewDocument(() => {window.Testophobia = {};});
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