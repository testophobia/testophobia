import fs from 'fs';
import path from 'path';
import {chromium, webkit, firefox} from 'playwright';
import {resolveNodeModuleFile} from './utils/file/file.js';
import {performAction} from './utils/test/perform-action.js';

process.setMaxListeners(Infinity);

const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);

/**
 * @class Interface to Playwright
 */
export class Browser {
  /**
   * Creates a Browser instance
   *
   * @constructor
   * @param {string} runnerId Used to identify this instance of the browser (for parallel execution)
   * @param {Output} output Reference to the Output instance
   */
  constructor(runnerId, output) {
    this.runnerId = runnerId;
    this.output = output;
  }

  /**
   * Launch the browser instance
   *
   * @param {object} config The Testophobia config object
   * @param {object} dimensions The width/height for this browser instance
   * @param {string} testRouteName The test name
   */
  async launch(config, dimensions, testRouteName) {
    try {
      this.browser = await {chromium, webkit, firefox}[config.currentBrowser].launch(this._getPlaywrightConfig(config.debug));
      this.baseDelay = config.delay || false;
      this.delayModifier = config.delayModifier || 1;
      this.pageLoadMax = config.pageLoadMax;
      await this._createPage();
      await this._initHandlers(config, testRouteName);
      this._setViewport(dimensions);
    } catch (err) {
      this.output.displayFailure(`Failed to launch browser runner: ` + err.message);
      /* istanbul ignore next */
      this.close();
    }
  }

  /**
   * Close the browser instance
   */
  async close() {
    if (this.browser) await this.browser.close();
  }

  /**
   * Navigate the browser to a url
   *
   * @param {string} url The url to navigate to
   */
  async goto(url) {
    if (this.pageLoadMax) {
      await Promise.race([this.page.goto(url, {waitUntil: 'networkidle'}), new Promise(x => setTimeout(x, this.pageLoadMax).unref())]);
    } else {
      await this.page.goto(url, {waitUntil: 'networkidle'});
    }
  }

  async goBack() {
    if (this.pageLoadMax) {
      await Promise.race([this.page.goBack({waitUntil: 'networkidle'}), new Promise(x => setTimeout(x, this.pageLoadMax).unref())]);
    } else {
      await this.page.goBack({waitUntil: 'networkidle'});
    }
    await this.page.waitForTimeout(1000);
  }

  /**
   * Have the browser take a screen shot of the current window
   *
   * @param {object} options The screenshot options
   */
  async screenshot(options) {
    await this.page.screenshot(options);
  }

  /**
   * Wait for the target to be visible
   *
   * @param {string} target The target selector
   */
  async waitForTarget(target) {
    await this.page.waitForSelector(target);
  }

  /**
   * Read the user output string to display in the console
   *
   * @return {string} The user output string
   */
  async readUserOutput() {
    return await this.page.evaluate(() => window.Testophobia.output);
  }

  /**
   * Perform the action against the current page
   *
   * @param {object} action The test action to be performed
   * @param {object} test The test that contains the action
   */
  async performAction(action, test) {
    await performAction(action, this.page, test);
    let delay = action.delay || this.baseDelay;
    delay = delay * this.delayModifier;
    if (delay) await this.page.waitForTimeout(delay);
  }

  _getPlaywrightConfig(debug = false) {
    const options = {ignoreDefaultArgs: ['--hide-scrollbars']};
    return debug ? Object.assign({}, {headless: false, slowMo: 250}, options) : options;
  }

  async _initHandlers(config, testRouteName) {
    this.page.on('dialog', dialog => dialog.accept()); //TODO - someday figure out to give tests control over this
    if (config.debug || config.verbose) this.page.on('console', msg => this.output.displayDebugMessage(`\nCHROMIUM LOG: ${msg.text()}`));
    const lolex = this._getLolex();
    /* istanbul ignore next */
    await this.page.addInitScript(`
      ${lolex}
      const mockDate = lolex.createClock(${config.defaultTime});
      window.Date = mockDate.Date;
      window.Testophobia = {currentTest: '${testRouteName}', golden: ${!!config.golden}};
    `);
  }

  async _addScript(pathToUse) {
    return this.page.addScriptTag({path: await resolveNodeModuleFile(pathToUse)});
  }

  async _createPage() {
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
    return this.page.setViewportSize(d);
  }
};
