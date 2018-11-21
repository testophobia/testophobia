/* global exports, require */
const fs = require('fs');
const {PNG} = require('pngjs');
const jpeg = require('jpeg-js');

exports.retrieveImageData = (path, fileType) => {
  if (!path || !fileType) return 0;
  let img;
  try {
    img = fs.readFileSync(path);
    return fileType === 'jpeg' ? jpeg.decode(img, true) : PNG.sync.read(img);
  } catch (err) {return 0;}
};