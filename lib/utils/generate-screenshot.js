/* global require, exports */
const {deleteFile} = require('.');
const {optimizeImage} = require('./optimize-image');

exports.generateScreenshot = async (path, dimensions, clipRegion, fileType, browser, quality, onFailure) => {
  try {
    let options = _getScreenshotOptions(path, fileType, dimensions, clipRegion, quality);
    await browser.screenshot(options);
    await _optimizeImages(path, dimensions, clipRegion, fileType);
    await deleteFile(path);
    return 0;
  } catch (err) {
    onFailure('  ' + err);
    return 1;
  }
};

const _getScreenshotOptions = (path, fileType, dimensions, clipRegion, quality) => {
  let clip;
  if (clipRegion) {
    clip = {};
    clip.x = (clipRegion.left || 0);
    clip.y = (clipRegion.top || 0);
    clip.width = (clipRegion.right) ? dimensions.width - clipRegion.right - clip.x: dimensions.width - clip.x;
    clip.height = (clipRegion.bottom) ? dimensions.height - clipRegion.bottom - clip.y: dimensions.height - clip.y;
  }
  const options = {
    path,
    type: fileType,
    clip: clip
  };
  if (fileType === 'jpeg') options.quality = quality;
  return options;
};

const _optimizeImages = (path, dimensions, clipRegion, fileType) => {
  const w = (clipRegion) ? clipRegion.width : dimensions.width;
  const h = (clipRegion) ? clipRegion.height : dimensions.height;
  const sw = dimensions.scale ? Math.floor(w * dimensions.scale) : w;
  const sh = dimensions.scale ? Math.floor(h * dimensions.scale) : h;
  return optimizeImage(path, {sw, sh}, fileType);
};