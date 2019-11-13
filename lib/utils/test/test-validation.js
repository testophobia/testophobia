/* global exports */
const {getActionFileName} = require('../file/file-name');

/**
 * Ensure test actions have unique descriptions
 *
 * @param {object} config The config file to check
 * @param {object} test The test file to check for overrides
 * @param {string} screenType The screen dimension that corresponds to the clip region
 * @return {object} The clip region definition
 */
exports.validateUniqueActionDescriptions = (actions, output) => {
  if (actions) {
    const actionNames = [];
    actions.forEach((a, i) => {
      const name = getActionFileName(i, a);
      if (actionNames.includes(name)) {
        output.displayFailure('Duplicate action description: ' + getActionFileName(i, a, true));
      }
      actionNames.push(name);
    });
  }
};

exports.checkBaseUrl = (baseUrl, output) => {
  const slashes = baseUrl.match(/\//g);
  const hashes = baseUrl.match(/\#/);
  if ((slashes && slashes.length > 2) || (hashes && hashes.length))
    output.displayFailure('Error: baseUrl should only contain a domain name, but a path was supplied. Handle all pathing in test files.');
};
