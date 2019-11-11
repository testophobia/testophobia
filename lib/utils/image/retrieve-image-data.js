/* global exports, require */
const fs = require('fs');
const {PNG} = require('pngjs');
const jpeg = require('jpeg-js');

/**
 * Get the image data for an image file on disk
 */
exports.retrieveImageData = (path, fileType) => {
  try {
    const img = fs.readFileSync(path);
    return fileType === 'jpeg' ? jpeg.decode(img, true) : PNG.sync.read(img);
  } catch (err) {
    return 0;
  }
};
