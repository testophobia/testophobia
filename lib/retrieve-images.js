/* global exports, require */
const fs = require('fs');
const {PNG} = require('pngjs');
const jpeg = require('jpeg-js');

exports.retrieveImages = (filePath, testDirectory, goldenDirectory, fileType) => {
  let img1, img2;
  img1 = readImage(fs.readFileSync(`${testDirectory}/${filePath}`), fileType);
  try {
    img2 = readImage(fs.readFileSync(`${goldenDirectory}/${filePath}`), fileType);
  } catch (error) {
    return {error: `Golden Image is missing for: ${filePath}`};
  }
  return {img1, img2};
};

const readImage = (img, fileType) => fileType === 'jpeg' ? jpeg.decode(img, true) : PNG.sync.read(img);