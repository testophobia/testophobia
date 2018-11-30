/* global require, exports */
const {deleteFile} = require('.');
const {optimizeImage} = require('./optimize-image');

exports.generateScreenshot = async (path, dimensions, fileType, browser, quality = false) => {
  try {
    let options = _getScreenshotOptions(path, fileType, quality);
    await browser.screenshot(options);
    await _optimizeImages(path, dimensions, fileType);
    await deleteFile(path);
    return 0;
  } catch (err) {
    return 1;
  }
};

const _getScreenshotOptions = (path, fileType, quality) => {
  const options = {
    path,
    type: fileType
  };
  if (fileType === 'jpeg') options.quality = quality;
  return options;
};

const _optimizeImages = (path, dimensions, fileType) => {
  const width = dimensions.scale ? Math.floor(dimensions.width * dimensions.scale) : dimensions.width;
  const height = dimensions.scale ? Math.floor(dimensions.height * dimensions.scale) : dimensions.height;
  return optimizeImage(path, {width, height}, fileType);
};