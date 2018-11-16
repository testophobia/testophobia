/* global exports, require */
const fs = require('fs');
const {PNG} = require('pngjs');
const jpeg = require('jpeg-js');

exports.retrieveImages = (filePath, testDirectory, goldenDirectory, fileType) => {
  let img1, img2;
  img1 = fs.readFileSync(`${testDirectory}/${filePath}`);
  img1 = readImage(img1, fileType);
  try {
    img2 = fs.readFileSync(`${goldenDirectory}/${filePath}`);
  } catch (error) {
    return {error: `Golden Image is missing for: ${filePath}`};
  }
  img2 = readImage(img2, fileType);
  return {img1, img2};
};

const readImage = (img, fileType) => fileType === 'jpeg' ? jpeg.decode(img, true) : PNG.sync.read(img);