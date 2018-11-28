/* global exports */
exports.handleDimensions = (dim, test) => {
  let dimensions = dim;
  if (test.hasOwnProperty('dimensions')) {
    test.dimensions.forEach(d => {
      let i = dimensions.findIndex(e => e.type === d.type);
      i > -1 ? dimensions[i] = d : dimensions.push(d);
    });
  }
  return dimensions;
};