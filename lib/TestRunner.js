/* global require, exports */
const fs = require('fs');
const path = require('path');
const {Browser} = require('./Browser');
const {asyncForEach, cleanTargetName, deleteFile} = require('./utils');
const {generateScreenshot} = require('./utils/generate-screenshot');
const {handleDimensions} = require('./utils/handle-dimensions');
const {getClipRegion, getActionClipRegion} = require('./utils/clip-regions');
const {ScreenCompare} = require('./ScreenCompare');

exports.TestRunner = class TestRunner {
  constructor(config, test, testDimension, dirToUse, testResults, output = false) {
    this.config = config;
    this.test = test;
    this.dimensionType = testDimension.type;
    this.dimensions = testDimension;
    this.dirToUse = dirToUse;
    this.testResults = testResults;
    this.output = output;
  }

  async run(testRouteName) {
    await this._executeScreenshots(this.dimensionType, testRouteName);
    return this.testResults;
  }

  async _executeScreenshots(screenType, testRouteName) {
    this.output.updateSpinnerDisplay(false, this.testResults, true);
    if (this.output) this.output.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${screenType})`, false, this.testResults);
    let dimensions = await handleDimensions(this.config.dimensions, this.test);
    dimensions = dimensions.find(d => d.type === screenType);
    let {fileName, path} = this._getPath(screenType, testRouteName);
    this._readGoldenDir(fileName);
    await this._initBrowser(dimensions);
    await this._navigateToPage();
    await this._handleScreenshots(path, fileName, screenType, testRouteName, dimensions);
    this.browser.close();
  }

  async _initBrowser(dimensions) {
    let options = {debug: this.config.debug, dimensions, defaultTime: this.config.defaultTime, baseDelay: this.config.delay, delayModifier: this.config.delayModifier};
    this.browser = new Browser();
    await this.browser.launch(options);
  }

  async _navigateToPage() {
    await this._checkBaseUrl();
    const url = `${this.config.baseUrl}${this.test.path ? '/' + this.test.path.replace(/^\/+/g, '') : ''}`;
    if (this.output) this.output.prependDebugMessageToSpinner(` - url: ${url}`, false, this.testResults);
    try {
      await this.browser.goto(url);
    } catch (err) {
      if (this.output) this.output.displayFailure('baseUrl supplied cannot be reached.');
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
    if (!this.test.skipScreen) {
      await generateScreenshot(path, dimensions, clipRegion, this.config.fileType, this.browser, this.config.quality, (msg) => this.output.displayFailure(msg));
      if (!this.config.golden) {
        let filePath = `${this.dimensions.type}/${testRouteName}/initial-state.${this.config.fileType}`;
        this.existingGoldens.splice(this.existingGoldens.indexOf(filePath), 1);
        await this._runComparison(testRouteName, filePath);
      }
    }
    this.output.incrementTestCount();
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
    const sc = new ScreenCompare(this.config, this.test, this.dimensions, this.output);
    return sc.run(testRouteName, filePath, action, index);
  }

  _getPath(screenType, route) {
    const fileName = screenType + '/' + (route ? route : 'root');
    const path = `${this.dirToUse}/${fileName}/initial-state-unscaled.${this.config.fileType}`;
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
      if (this.output) this.output.displayFailure('Targets are required for actions.');
    }
    const targetName = cleanTargetName(action.target);
    try {
      await this.browser.performAction(action, this.test);
    } catch (err) {
      if (this.output) this.output.displayFailure(`Issue performing action: ${action.type} for test: ${this.test.name}`);
    }
    if (!action.skipScreen) {
      if (this.output) this.output.prependDebugMessageToSpinner(`Generating Screenshot - ${testRouteName} (${screenType}-${action.type}-${targetName})`, false, this.testResults);
      const path = `${this.dirToUse}/${f}/${actionIndex}-${action.type}-${targetName}-unscaled.${this.config.fileType}`;
      await generateScreenshot(path, dimensions, clipRegion, this.config.fileType, this.browser, this.config.quality, (msg) => this.output.displayFailure(msg));
      if (!this.config.golden) {
        const filePath = `${this.dimensions.type}/${testRouteName}/${actionIndex}-${action.type}-${targetName}.${this.config.fileType}`;
        this.existingGoldens.splice(this.existingGoldens.indexOf(filePath), 1);
        await this._runComparison(testRouteName, filePath, action, actionIndex);
      }
      if (this.output) this.output.incrementTestCount();
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
      if (this.output) this.output.prependDebugMessageToSpinner(`Deleting unused golden - ${g}`, false, this.testResults);
      await deleteFile(`${this.config.goldenDirectory}/${g}`);
    });
  }

  waitForRender(delay) {
    delay = delay * (this.config.delayModifier || 1);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

};
