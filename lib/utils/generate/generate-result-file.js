import fs from 'fs';

/**
 * Produce a results file, to feed to the Testophobia Viewer
 *
 * @param {object} config The Testophobia config file
 * @param {object} tests/failures The tests and failures objects to write out
 * @param {boolean} keepFailures Flag to not overwrite previous failures
 */
export const generateResultFile = (config, {tests, failures}, keepFailures) => {
  const resultFile = config.diffDirectory + '/' + config.currentBrowser + (keepFailures ? '/results-' + new Date().getTime() + '.json' : '/results.json');
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
