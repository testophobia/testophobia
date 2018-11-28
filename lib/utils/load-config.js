/* global require, process, module */
'use strict';
const fs = require('fs');
const path = require('path');
const esm = require('esm');
const isPlainObject = require('is-plain-object');
const pkgConf = require('pkg-conf');

const NO_SUCH_FILE = Symbol('no testophobia.config.js file');
const MISSING_DEFAULT_EXPORT = Symbol('missing default export');

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
  dimensions: [
    {type: 'desktop', width: 1024, height: 768},
    {type: 'mobile', width: 375, height: 812}
  ]
};

function loadConfig(passedDefaults = {}) {
  const packageConf = pkgConf.sync('testophobia');
  const filepath = pkgConf.filepath(packageConf);
  let testConfig = fs.existsSync(`${process.cwd()}/testophobia.config.js`);
  let projectDir =
    testConfig || filepath === null ? process.cwd() : path.dirname(filepath);
  let fileConf;
  try {
    ({default: fileConf = MISSING_DEFAULT_EXPORT} = esm(module, {
      cjs: false,
      force: true,
      mode: 'all'
    })(path.join(projectDir, 'testophobia.config.js')));
  } catch (error) {
    if (error && error.code === 'MODULE_NOT_FOUND') {
      fileConf = NO_SUCH_FILE;
    } else {
      throw Object.assign(new Error('Error loading testophobia.config.js'), {
        parent: error
      });
    }
  }

  if (fileConf === MISSING_DEFAULT_EXPORT) {
    throw new Error(
      'testophobia.config.js must have a default export, using ES module syntax'
    );
  }

  if (fileConf !== NO_SUCH_FILE) {
    if (Object.keys(packageConf).length > 0) {
      throw new Error(
        'Conflicting configuration in testophobia.config.js and package.json'
      );
    }

    if (fileConf && typeof fileConf.then === 'function') {
      throw new TypeError('testophobia.config.js must not export a promise');
    }
    if (!isPlainObject(fileConf) && typeof fileConf !== 'function') {
      throw new TypeError(
        'testophobia.config.js must export a plain object or factory function'
      );
    }

    if (typeof fileConf === 'function') {
      fileConf = fileConf({projectDir});
      if (fileConf && typeof fileConf.then === 'function') {
        throw new TypeError(
          'Factory method exported by testophobia.config.js must not return a promise'
        );
      }
      if (!isPlainObject(fileConf)) {
        throw new TypeError(
          'Factory method exported by testophobia.config.js must return a plain object'
        );
      }
    }
  }

  return Object.assign({}, configDefaults, passedDefaults, fileConf, packageConf, {projectDir});
}
module.exports = {
  loadConfig,
  configDefaults
};
