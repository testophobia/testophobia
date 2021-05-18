'use strict';
import fs from 'fs';
import path from 'path';
import {isPlainObject} from 'is-plain-object';
import findConfig from '../../deps/find-config.js';

const MISSING_DEFAULT_EXPORT = Symbol('missing default export');

/**
 * The default values for a testophobia.config.js file
 */
export const configDefaults = {
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
export async function loadUserConfig() {
  const userCfg = findConfig.obj('.testophobia.config.js', {dot: true});
  if (userCfg) {
    return await loadConfigFile(userCfg.dir, '.testophobia.config.js');
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
export async function loadConfig(cfgDirectory, configFileName = 'testophobia.config.js') {
  const projectDir = cfgDirectory || process.cwd();
  return Object.assign({}, configDefaults, await loadConfigFile(projectDir, configFileName), {projectDir});
}

/**
 * Load a testophobia config file
 *
 * @param {string} projectDir The directory containing the config file
 * @param {string} configFileName The name of the config file to load
 * @return {object} The config object
 */
export async function loadConfigFile(projectDir, configFileName) {
  try {
    const config = await import(path.join(projectDir, configFileName));
    return !!config ? config.default : null;
  } catch (error) {
    throw new Error('Error loading testophobia config file');
  }
}
