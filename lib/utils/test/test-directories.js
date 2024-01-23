import fs from 'fs';
import path from 'path';
import {createDirectory, deleteDirectory, deleteGlob} from '../file/file.js';
import {asyncForEach} from '../index.js';

/**
 * Create the directories necessary for a given test/dimensions
 *
 * @param {object} config The Testophobia config object
 * @param {Output} output Reference to the Output instance
 * @param {string} testRouteName The test name
 * @param {array} dimensions The screen dimensions for the test
 * @param {array} excludes The excluded screen dimensions
 */
export const createTestDirectories = async (config, output, testRouteName, dimensions, excludes) => {
  if (!config.golden && !fs.existsSync(`${config.diffDirectory}/${config.currentBrowser}/`))
    createDirectory(`${config.diffDirectory}/${config.currentBrowser}`);
  const testRunRootDir = path.join(config.golden ? config.goldenDirectory : config.testDirectory, config.currentBrowser);
  await asyncForEach(dimensions, d => {
    if (!excludes || !excludes.includes(d.type)) {
      const dirToCheck = `${config.goldenDirectory}/${config.currentBrowser}/${d.type}/${testRouteName}`;
      if (!config.golden && !fs.existsSync(dirToCheck)) output.displayFailure('Missing Golden Images: ' + dirToCheck);
      const dirToCreate = `${testRunRootDir}/${d.type}/${testRouteName}`;
      if (config.golden) deleteDirectory(dirToCreate).then(() => createDirectory(dirToCreate));
      else createDirectory(dirToCreate);
    }
  });
};

/**
 * Clear test/diff/golden directories
 *
 * @param {object} config The Testophobia config object
 * @param {Output} output Reference to the Output instance
 * @param {string} path Glob path to a specific path to clear
 * @param {boolean} includeGolden also clear golden directories
 * @param {boolean} silent No console output for this action
 */
export const clearTestophobiaDirectories = (config, output, path, includeGolden, silent) => {
  if (path) {
    deleteGlob(path);
    output.displayWarning(`${path} cleared.`);
    return 1;
  }
  const deletes = [deleteDirectory(config.diffDirectory), deleteDirectory(config.testDirectory)];
  if (includeGolden) deletes.push(deleteDirectory(config.goldenDirectory));
  return Promise.all(deletes)
    .then(() => {
      if (!silent) output.displayWarning(`Testophobia directories cleared.`);
      return 1;
    })
    .catch(() => 1);
};
