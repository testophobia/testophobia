/* global exports, require */
const sharp = require('sharp');

sharp.cache(false);

exports.optimizeImage = (path, dimensions, fileType) => {
  return sharp(path)
    .resize(dimensions.width, dimensions.height, {
      fastShrinkOnLoad: false
    })
    .toFile(path.replace(`-unscaled.${fileType}`, `.${fileType}`));
};
