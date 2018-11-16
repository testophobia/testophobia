/* global exports, require */
const fs = require('fs');
const {PNG} = require('pngjs');
const jpeg = require('jpeg-js');

exports.retrieveImageData = (path, fileType) => {
  let img = fs.readFileSync(path);
  return fileType === 'jpeg' ? jpeg.decode(img, true) : PNG.sync.read(img);
};

