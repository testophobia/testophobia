import {glob} from 'glob';
import path from 'path';
import {asyncForEach} from '../index.js';

/**
 * Resolve the list of test files (path, array of paths, globs, etc)
 *
 * @param {object} config The Testophobia config file
 * @return {array} The array of resolved test paths
 */
export const formatTests = async config => {
  let testPaths = [];
  if (config.tests) {
    typeof config.tests === 'string'
      ? (testPaths = await glob.sync(config.tests))
      : await asyncForEach(config.tests, async t => {
          const tp = await glob.sync(t);
          tp.forEach(t => testPaths.push(t));
        });
  }
  const tests = [];
  await asyncForEach(testPaths, async t => {
    if (t.endsWith('.js')) {
      const testObj = await readTestFileToObject(t);
      testObj.testDefinitionPath = t;
      tests.push(testObj);
    }
  });
  return tests.length ? tests : 0;
};

/**
 * Read a test file into a javascript object
 *
 * @param {string} testPath The path to the file to load
 * @return {object} The transformed js object
 */
export const readTestFileToObject = async testPath => {
  const file = await import(path.join(process.cwd(), testPath));
  return !!file ? file.default : null;
};
