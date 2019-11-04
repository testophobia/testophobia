/* global require, exports */
const fs = require('fs');
const path = require('path');
const {Browser} = require('./Browser');
const {asyncForEach, deleteFile} = require('./utils');
const {generateScreenshot, writeGoldensManifest} = require('./utils/generate-screenshot');
const {handleDimensions} = require('./utils/handle-dimensions');
const {getClipRegion, getActionClipRegion} = require('./utils/clip-regions');
const {ScreenCompare} = require('./ScreenCompare');
const {getActionFileName, getIntialFileName} = require('./utils/file-name');

exports.TestRunner = class TestRunner {
  constructor(runnerId, config, test, testDimension, dirToUse, testResults, output) {
    this.runnerId = runnerId;
    this.config = config;
    this.test = test;
    this.dimensionType = testDimension.type;
    this.dimensions = testDimension;
    this.dirToUse = dirToUse;
    this.testResults = testResults;
    this.output = output;
  }

  async run(testRouteName) {
    this._validateUniqueActionDescriptions();
    await this._executeScreenshots(this.dimensionType, testRouteName);
    return this.testResults;
  }

  async _executeScreenshots(screenType, testRouteName) {
    this.output.updateSpinnerDisplay(false, this.testResults, true);
    this.output.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${screenType})`, false, this.testResults);
    let dimensions = await handleDimensions(this.config.dimensions, this.test);
    dimensions = dimensions.find(d => d.type === screenType);
    let {fileName, path} = this._getPath(screenType, testRouteName);
    this._readGoldenDir(fileName);
    await this._initBrowser(dimensions);
    await this._navigateToPage();
    await this._handleScreenshots(path, fileName, screenType, testRouteName, dimensions);
    if (!this.config.debug) this.browser.close();
  }

  async _initBrowser(dimensions) {
    let options = {
      debug: this.config.debug,
      dimensions,
      defaultTime: this.config.defaultTime,
      baseDelay: this.config.delay,
      delayModifier: this.config.delayModifier,
      pageLoadMax: this.config.pageLoadMax
    };
    this.browser = new Browser(this.runnerId);
    await this.browser.launch(options);
  }

  async _navigateToPage() {
    await this._checkBaseUrl();
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

  _checkBaseUrl() {
    let slashes = this.config.baseUrl.match(/\//g);
    let hashes = this.config.baseUrl.match(/\#/);
    if ((slashes && slashes.length > 2) || (hashes && hashes.length))
      this.output.displayFailure('Error: baseUrl should only contain a domain name, but a path was supplied. Handle all pathing in test files.');
  }

  async _handleScreenshots(path, fileName, screenType, testRouteName, dimensions) {
    const delay = this.test.delay || this.config.delay;
    if (delay) await this.waitForRender(delay);
    let clipRegion = getClipRegion(this.config, this.test, screenType);
    if (this.config.golden) writeGoldensManifest(`${this.dirToUse}/${fileName}`, this.test);
    if (!this.test.skipScreen) {
      await generateScreenshot(path, dimensions, clipRegion, this.config.fileType, this.browser, this.config.quality, msg => this.output.displayFailure(msg));
      if (!this.config.golden) {
        const filePath = `${this.dimensions.type}/${testRouteName}/${getIntialFileName(true)}.${this.config.fileType}`;
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
      await asyncForEach(this.test.actions, async (b, i) => {
        clipRegion = getActionClipRegion(b, this.test, screenType) || clipRegion;
        await this._handleActionScreenshots(`${fileName}`, b, dimensions, clipRegion, testRouteName, screenType, i);
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

  async _runComparison(testRouteName, filePath, action = false, index = false) {
    let resp = await this._compareScreenshots(testRouteName, filePath, action, index);
    if (Object.keys(resp).length) {
      await this.testResults.push(resp);
      this.output.prependDebugMessageToSpinner('Screenshot was not a match!', false, this.testResults, true);
    }
  }

  _compareScreenshots(testRouteName, filePath, action, index) {
    this.output.prependDebugMessageToSpinner(`Comparing Screenshots - ${testRouteName} (${this.dimensions.type})`, false, this.testResults);
    const testDefPath = !isNaN(this.test.inlineIndex) ? this.test.inlineIndex : this.test.testDefinitionPath;
    const sc = new ScreenCompare(this.config, this.test, testDefPath, this.dimensions, this.output);
    return sc.run(testRouteName, filePath, action, index);
  }

  _getPath(screenType, route) {
    const fileName = screenType + '/' + (route ? route : 'root');
    const path = `${this.dirToUse}/${fileName}/${getIntialFileName(false)}.${this.config.fileType}`;
    return {fileName, path};
  }

  _getScreenshotOptions(path) {
    const options = {
      path,
      type: this.config.fileType
    };
    if (this.config.fileType === 'jpeg') options.quality = this.config.quality;
    return options;
  }

  async _handleActionScreenshots(f, action, dimensions, clipRegion, testRouteName, screenType, actionIndex) {
    if (this.config.bail && this.testResults.length) return;
    if (action.excludeDimensions && action.excludeDimensions.includes(screenType)) return;
    if (!action.target) {
      this.output.displayFailure('Targets are required for actions.');
    }
    try {
      await this.browser.performAction(action, this.test);
    } catch (err) {
      this.output.displayFailure(`Issue performing action: ${action.type} for test: ${this.test.name}`);
    }
    if (!action.skipScreen) {
      const delay = action.delay || this.config.delay;
      if (delay) await this.waitForRender(delay);
      const fileName = getActionFileName(actionIndex, action);
      this.output.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${fileName})`, false, this.testResults);
      const path = `${this.dirToUse}/${f}/${fileName}-unscaled.${this.config.fileType}`;
      await generateScreenshot(path, dimensions, clipRegion, this.config.fileType, this.browser, this.config.quality, msg => this.output.displayFailure(msg));
      if (!this.config.golden) {
        const filePath = `${this.dimensions.type}/${testRouteName}/${fileName}.${this.config.fileType}`;
        this.existingGoldens.splice(this.existingGoldens.indexOf(filePath), 1);
        await this._runComparison(testRouteName, filePath, action, actionIndex);
      }
      this.output.incrementTestCount();
      this.output.updateSpinnerDisplay(false, this.testResults, true);
    }
  }

  _readGoldenDir(fileName) {
    const dir = `${this.config.goldenDirectory}/${fileName}`;
    if (!fs.existsSync(dir)) return;
    this.existingGoldens = fs.readdirSync(dir).reduce((files, file) => {
      const name = path.join(dir, file);
      const isDirectory = fs.statSync(name).isDirectory();
      return isDirectory ? files : [...files, path.relative(this.config.goldenDirectory, name)];
    }, []);
  }

  async _pruneUnusedGoldens() {
    if (!this.existingGoldens) return;
    await asyncForEach(this.existingGoldens, async g => {
      if (!g.endsWith('manifest')) {
        this.output.prependDebugMessageToSpinner(`Deleting unused golden - ${g}`, false, this.testResults);
        await deleteFile(`${this.config.goldenDirectory}/${g}`);
      }
    });
  }

  _validateUniqueActionDescriptions() {
    if (this.test.actions) {
      const actionNames = [];
      this.test.actions.forEach((a, i) => {
        const name = getActionFileName(i, a);
        if (actionNames.includes(name)) {
          this.output.displayFailure('Duplicate action description: ' + getActionFileName(i, a, true));
          return;
        }
        actionNames.push(name);
      });
    }
  }

  waitForRender(delay) {
    delay = delay * (this.config.delayModifier || 1);
    return new Promise(resolve => setTimeout(resolve, delay));
  }
};
