/* global exports, module, require, process */
const glob = require('glob');
const path = require('path');
const esm = require('esm');
const {asyncForEach} = require('./index');

exports.formatTests = async config => {
  let testPaths = [];
  if (config.tests) {
    typeof config.tests === 'string'
      ? (testPaths = await glob.sync(config.tests))
      : await asyncForEach(config.tests, async t => {
          const tp = await glob.sync(t);
          tp.forEach(t => testPaths.push(t));
        });
  }
  return _populateTests(testPaths);
};

const readTestFileToObject = testPath => {
  return esm(module, {
    cjs: false,
    force: true,
    mode: 'all'
  })(path.join(process.cwd(), testPath));
};

const _populateTests = async testPaths => {
  const tests = [];
  await asyncForEach(testPaths, t => {
    const file = readTestFileToObject(t);
    if (file.default) {
      file.default.testDefinitionPath = t;
      tests.push(file.default);
    }
  });
  return tests.length ? tests : 0;
};

exports.readTestFile = readTestFileToObject;
