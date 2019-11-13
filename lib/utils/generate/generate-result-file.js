/* global exports, require */
const fs = require('fs');

/**
 * Produce a results file, to feed to the Testophobia Viewer
 *
 * @param {object} config The Testophobia config file
 * @param {object} tests/failures The tests and failures objects to write out
 */
exports.generateResultFile = (config, {tests, failures}) => {
  const resultFile = config.diffDirectory + '/results.json';
  const results = {
    tests: tests,
    date: Date.now(),
    fileType: config.fileType,
    quality: config.fileType === 'png' ? 'n/a' : config.quality,
    threshold: config.threshold,
    baseUrl: config.baseUrl,
    screenTypes: config.dimensions,
    failures: failures
  };
  fs.writeFileSync(resultFile, JSON.stringify(results));
};
