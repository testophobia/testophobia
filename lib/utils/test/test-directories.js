/* global exports */
const fs = require('fs');
const {createDirectory, deleteDirectory, deleteGlob} = require('../file/file');
const {asyncForEach} = require('../');

/**
 * Create the directories necessary for a given test/dimensions
 *
 * @param {object} config The Testophobia config object
 * @param {Output} output Reference to the Output instance
 * @param {string} testRouteName The test name
 * @param {array} dimensions The screen dimensions for the test
 * @param {array} excludes The excluded screen dimensions
 */
exports.createTestDirectories = async (config, output, testRouteName, dimensions, excludes) => {
  if (!config.golden && !fs.existsSync(`${config.diffDirectory}/`)) createDirectory(`${config.diffDirectory}`);
  const testRunRootDir = config.golden ? config.goldenDirectory : config.testDirectory;
  await asyncForEach(dimensions, d => {
    if (!excludes || !excludes.includes(d.type)) {
      const dirToCheck = `${config.goldenDirectory}/${d.type}/${testRouteName}`;
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
 */
exports.clearTestophobiaDirectories = (config, output, path) => {
  if (path) {
    deleteGlob(path);
    output.displayWarning(`${path} cleared.`);
    return 1;
  }
  const deletes = [deleteDirectory(config.diffDirectory), deleteDirectory(config.testDirectory)];
  if (config.golden) deletes.push(deleteDirectory(config.goldenDirectory));
  return Promise.all(deletes)
    .then(() => {
      output.displayWarning(`Testophobia directories cleared.`);
      return 1;
    })
    .catch(() => 1);
};
