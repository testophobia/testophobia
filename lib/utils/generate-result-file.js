/* global exports, require */
const fs = require('fs');

exports.generateResultFile = (config, {tests, failures}) => {
  if (!config) return 0;
  let resultFile = (config.diffDirectory) + '/results.json';
  fs.createWriteStream(resultFile);
  let results = {
    tests: tests,
    date: Date.now(),
    fileType: config.fileType,
    quality: (config.fileType === 'png') ? 'n/a' : config.quality,
    threshold: config.threshold,
    baseUrl: config.baseUrl,
    screenTypes: config.dimensions,
    failures: failures
  };
  fs.appendFileSync(resultFile, JSON.stringify(results));
};