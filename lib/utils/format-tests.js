/* global exports, module, require, process */
const glob = require('glob');
const path = require('path');
const esm = require('esm');
const {asyncForEach} = require('./index');

exports.formatTests = async (config, target) => {
  if (typeof(target) === 'undefined') return 0;
  if (typeof target === 'object' && target.filter(t => Object.keys(t).includes('name')).length) return config.tests;
  let testPaths = [];
  typeof target === 'string' ? testPaths = await glob.sync(target) : await asyncForEach(target, async t => {
    let tp = await glob.sync(t);
    tp.forEach(t => testPaths.push(t));
  });
  if (!testPaths.length) {
    testPaths = await config.tests && Array.isArray(config.tests) ? config.tests.filter(t => t.name && t.name === target) : [];
    return testPaths.length ? testPaths : 0;
  }
  return _populateTests(testPaths);
};

const _populateTests = async testPaths => {
  let tests = [];
  await asyncForEach(testPaths, t => {
    let file = esm(module, {
      cjs: false,
      force: true,
      mode: 'all'
    })(path.join(process.cwd(), t));
    if (file.default) tests.push(file.default);
  });
  return tests.length ? tests : 0;
};