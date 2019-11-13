/* global require, process, module */
'use strict';
const fs = require('fs');
const path = require('path');
const esm = require('esm');
const isPlainObject = require('is-plain-object');
const findConfig = require('find-config');

const MISSING_DEFAULT_EXPORT = Symbol('missing default export');

/**
 * The default values for a testophobia.config.js file
 */
const configDefaults = {
  bail: false,
  verbose: false,
  threshold: 0.2,
  diffDirectory: './testophobia/diffs',
  goldenDirectory: './testophobia/golden-screens',
  testDirectory: './testophobia/test-screens',
  baseUrl: 'http://localhost:6789',
  fileType: 'png',
  defaultTime: 2068786800000,
  quality: 80,
  dimensions: [{type: 'desktop', width: 1024, height: 768}, {type: 'mobile', width: 375, height: 812}]
};

/**
 * Load a user's .testophobia.config.js file to override config values of a project
 *
 * @return {object} The config object
 */
function loadUserConfig() {
  const userCfg = findConfig.obj('.testophobia.config.js', {dot: true});
  if (userCfg) {
    return loadConfigFile(userCfg.dir, '.testophobia.config.js');
  } else {
    return {};
  }
}

/**
 * Load the main testophobia.config.js file
 *
 * @param {string} cfgDirectory The directory containing the config file
 * @param {string} configFileName The name of the config file to load
 * @return {object} The config object
 */
function loadConfig(cfgDirectory, configFileName = 'testophobia.config.js') {
  const projectDir = cfgDirectory || process.cwd();
  return Object.assign({}, configDefaults, loadConfigFile(projectDir, configFileName), {projectDir});
}

/**
 * Load a testophobia config file
 *
 * @param {string} projectDir The directory containing the config file
 * @param {string} configFileName The name of the config file to load
 * @return {object} The config object
 */
function loadConfigFile(projectDir, configFileName) {
  let fileConf;
  try {
    ({default: fileConf = MISSING_DEFAULT_EXPORT} = esm(module, {
      cjs: false,
      force: true,
      mode: 'all'
    })(path.join(projectDir, configFileName)));
  } catch (error) {
    if (error && error.code === 'MODULE_NOT_FOUND') {
      throw new Error(configFileName + ' not found!');
    } else {
      throw Object.assign(new Error('Error loading testophobia config file'), {
        parent: error
      });
    }
  }

  if (fileConf === MISSING_DEFAULT_EXPORT) {
    throw new Error('testophobia config file must have a default export, using ES module syntax');
  }
  if (fileConf && typeof fileConf.then === 'function') {
    throw new TypeError('testophobia config file must not export a promise');
  }
  if (!isPlainObject(fileConf) && typeof fileConf !== 'function') {
    throw new TypeError('testophobia config file must export a plain object or factory function');
  }
  if (typeof fileConf === 'function') {
    fileConf = fileConf({projectDir});
    if (fileConf && typeof fileConf.then === 'function') {
      throw new TypeError('Factory method exported by testophobia config file must not return a promise');
    }
    if (!isPlainObject(fileConf)) {
      throw new TypeError('Factory method exported by testophobia config file must return a plain object');
    }
  }
  return fileConf;
}

module.exports = {
  loadConfig,
  loadConfigFile,
  loadUserConfig,
  configDefaults
};
