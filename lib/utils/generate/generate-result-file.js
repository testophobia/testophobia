/* global exports, require */
const fs = require('fs');

/**
 * Produce a results file, to feed to the Testophobia Viewer
 */
exports.generateResultFile = (config, {tests, failures}) => {
  let resultFile = config.diffDirectory + '/results.json';
  let results = {
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
