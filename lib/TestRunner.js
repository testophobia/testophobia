/* global require, exports */
const fs = require('fs');
const path = require('path');
const {Browser} = require('./Browser');
const {asyncForEach} = require('./utils');
const {deleteFile} = require('./utils/file/file');
const {generateScreenshot, writeGoldensManifest} = require('./utils/generate/generate-screenshot');
const {resolveDimensions} = require('./utils/test/resolve-dimensions');
const {getClipRegion, getActionClipRegion} = require('./utils/test/clip-regions');
const {ScreenCompare} = require('./ScreenCompare');
const {getActionFileName, getIntialStateFileName} = require('./utils/file/file-name');
const {checkBaseUrl, validateUniqueActionDescriptions} = require('./utils/test/test-validation');

/**
 * @class Executes a single test
 */
exports.TestRunner = class TestRunner {
  /**
   * Creates a TestRunner instance
   *
   * @constructor
   * @param {string} runnerId Used to identify this instance of the browser (for parallel execution)
   * @param {object} config The Testophobia config object
   * @param {object} test The test to run
   * @param {object} testDimension The dimension that this test is being run for
   * @param {string} testRootPath Root path of the test being run
   * @param {array} testResults The results array to add this test run's results to
   * @param {Output} output The reference to the Output instance
   */
  constructor(runnerId, config, test, testDimension, testRootPath, testResults, output) {
    this.runnerId = runnerId;
    this.config = config;
    this.test = test;
    this.dimensions = testDimension;
    this.testRootPath = testRootPath;
    this.testResults = testResults;
    this.output = output;
  }

  /**
   * Run a single test
   *
   * @param {string} testRouteName The test name
   * @return {array} The updated test results array
   */
  async run(testRouteName) {
    validateUniqueActionDescriptions(this.test.actions, this.output);
    this.output.updateSpinnerDisplay(false, this.testResults, true);
    this.output.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${this.dimensions.type})`, false, this.testResults);
    const dimensions = await resolveDimensions(this.config, this.test).find(d => d.type === this.dimensions.type);
    const {fileName, path} = this._getPath(this.dimensions.type, testRouteName);
    this._readGoldenDir(fileName);
    await this._initBrowser(dimensions, testRouteName);
    await this._navigateToPage();
    await this._handleScreenshots(path, fileName, this.dimensions.type, testRouteName, dimensions);
    const output = await this._getUserOutput();
    if (!this.config.debug) this.browser.close();
    return output;
  }

  async _initBrowser(dimensions, testRouteName) {
    this.browser = new Browser(this.runnerId, this.output);
    await this.browser.launch(this.config, dimensions, testRouteName);
  }

  async _navigateToPage() {
    await checkBaseUrl(this.config.baseUrl, this.output);
    const url = `${this.config.baseUrl}${this.test.path ? '/' + this.test.path.replace(/^\/+/g, '') : ''}`;
    this.output.prependDebugMessageToSpinner(` - url: ${url}`, false, this.testResults);
    let navAttempts = 3;
    while (navAttempts > 0) {
      try {
        await this.browser.goto(url);
        return;
      } catch (err) {
        if (navAttempts > 1) {
          this.output.prependDebugMessageToSpinner('baseUrl supplied cannot be reached. Retrying...', false, this.testResults);
        } else {
          this.output.displayFailure(`baseUrl supplied cannot be reached: ${this.config.baseUrl}`);
        }
        navAttempts--;
      }
    }
  }

  async _handleScreenshots(path, fileName, screenType, testRouteName, dimensions) {
    const delay = this.test.delay || this.config.delay;
    if (delay) await this._waitForRender(delay);
    let clipRegion = getClipRegion(this.config, this.test, screenType);
    if (this.config.golden) writeGoldensManifest(`${this.testRootPath}/${fileName}`, this.test);
    if (!this.test.skipScreen) {
      await generateScreenshot(path, dimensions, clipRegion, this.config.fileType, this.browser, this.config.quality, msg => this.output.displayFailure(msg));
      if (!this.config.golden) {
        const filePath = `${this.dimensions.type}/${testRouteName}/${getIntialStateFileName(true)}.${this.config.fileType}`;
        this.existingGoldens.splice(this.existingGoldens.indexOf(filePath), 1);
        await this._runComparison(testRouteName, filePath);
      }
      this.output.incrementTestCount();
    }
    if (this._checkBail()) {
      this.output.updateSpinnerDisplay(true, this.testResults, true);
      return this.testResults;
    }
    this.output.updateSpinnerDisplay(false, this.testResults, true);
    if (this.test.actions) {
      let actionClipRegion;
      await asyncForEach(this.test.actions, async (b, i) => {
        actionClipRegion = getActionClipRegion(b, this.test, screenType);
        await this._handleActionScreenshots(`${fileName}`, b, dimensions, actionClipRegion || clipRegion, testRouteName, screenType, i);
      });
    }
    if (this._checkBail()) {
      this.output.updateSpinnerDisplay(true, this.testResults, true);
      return this.testResults;
    }
    if (!this.config.golden) await this._pruneUnusedGoldens();
  }

  _checkBail() {
    return this.config.bail && this.testResults.length;
  }

  async _getUserOutput() {
    return await this.browser.readUserOutput();
  }

  async _runComparison(testRouteName, filePath, action = false, index = false) {
    this.output.prependDebugMessageToSpinner(`Comparing Screenshots - ${testRouteName} (${this.dimensions.type})`, false, this.testResults);
    const testDefPath = !isNaN(this.test.inlineIndex) ? this.test.inlineIndex : this.test.testDefinitionPath;
    const sc = new ScreenCompare(this.config, this.test, testDefPath, this.dimensions, this.output);
    const compareResult = sc.run(testRouteName, filePath, action, index);
    if (Object.keys(compareResult).length) {
      await this.testResults.push(compareResult);
      this.output.prependDebugMessageToSpinner('Screenshot was not a match!', false, this.testResults, true);
    }
  }

  _getPath(screenType, route) {
    const fileName = screenType + '/' + (route ? route : 'root');
    const path = `${this.testRootPath}/${fileName}/${getIntialStateFileName(false)}.${this.config.fileType}`;
    return {fileName, path};
  }

  async _handleActionScreenshots(f, action, dimensions, clipRegion, testRouteName, screenType, actionIndex) {
    if (this._checkBail()) return;
    if (action.excludeDimensions && action.excludeDimensions.includes(screenType)) return;
    if (!action.target) {
      this.output.displayFailure('Targets are required for actions.');
    }
    try {
      await this.browser.performAction(action, this.test);
    } catch (err) {
      this.output.displayFailure(`Issue performing action: ${action.type} for test: ${this.test.name} - ${err.message}`);
    }
    const delay = action.delay || this.config.delay;
    if (delay) await this._waitForRender(delay);
    if (!action.skipScreen) {
      const fileName = getActionFileName(actionIndex, action);
      this.output.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${fileName})`, false, this.testResults);
      const path = `${this.testRootPath}/${f}/${fileName}-unscaled.${this.config.fileType}`;
      await generateScreenshot(path, dimensions, clipRegion, this.config.fileType, this.browser, this.config.quality, msg => this.output.displayFailure(msg));
      if (!this.config.golden) {
        const filePath = `${this.dimensions.type}/${testRouteName}/${fileName}.${this.config.fileType}`;
        this.existingGoldens.splice(this.existingGoldens.indexOf(filePath), 1);
        await this._runComparison(testRouteName, filePath, action, actionIndex);
      }
      this.output.incrementTestCount();
      this.output.updateSpinnerDisplay(false, this.testResults, true);
    }
    if (action.navigateBackAfterAction) await this.browser.goBack();
  }

  _readGoldenDir(fileName) {
    const rootDir = `${this.config.goldenDirectory}/${this.config.currentBrowser}`;
    const dir = `${rootDir}/${fileName}`;
    if (!fs.existsSync(dir)) return;
    this.existingGoldens = fs.readdirSync(dir).reduce((files, file) => {
      const name = path.join(dir, file);
      const isDirectory = fs.statSync(name).isDirectory();
      return isDirectory ? files : [...files, path.relative(rootDir, name)];
    }, []);
  }

  async _pruneUnusedGoldens() {
    if (!this.existingGoldens) return;
    await asyncForEach(this.existingGoldens, async g => {
      if (!g.endsWith('manifest')) {
        this.output.prependDebugMessageToSpinner(`Deleting unused golden - ${g}`, false, this.testResults);
        await deleteFile(`${this.config.goldenDirectory}/${this.config.currentBrowser}/${g}`);
      }
    });
  }

  _waitForRender(delay) {
    return new Promise(resolve => setTimeout(resolve, delay * (this.config.delayModifier || 1)));
  }
};
