/* global exports */

/**
 * Get the window dimensions to use for a given test
 *
 * @param {array} config The Testophobia config file
 * @param {object} test The test file to check dimension on
 * @return {array} The resolved dimensions
 */
exports.resolveDimensions = (config, test) => {
  let dimensions = config.dimensions;
  if (test.hasOwnProperty('dimensions')) {
    test.dimensions.forEach(d => {
      let i = dimensions.findIndex(e => e.type === d.type);
      i > -1 ? (dimensions[i] = d) : dimensions.push(d);
    });
  }
  return dimensions;
};
