/* global exports, require */
const fs = require('fs');
const {PNG} = require('pngjs');
const jpeg = require('jpeg-js');

exports.retrieveImageData = (path, fileType) => {
  try {
    const img = fs.readFileSync(path);
    return fileType === 'jpeg' ? jpeg.decode(img, true) : PNG.sync.read(img);
  } catch (err) {
    return 0;
  }
};
