/* global require, exports */
const fs = require('fs');
const {deleteFile} = require('.');
const {optimizeImage} = require('./optimize-image');
const {getActionFileName, getIntialFileName} = require('./file-name');

exports.generateScreenshot = async (path, dimensions, clipRegion, fileType, browser, quality, onFailure) => {
  try {
    let clip;
    if (clipRegion) {
      clip = calcClip(clipRegion, dimensions);
    }
    let options = _getScreenshotOptions(path, fileType, clip, quality);
    await browser.screenshot(options);
    await _optimizeImages(path, dimensions, clip, fileType);
    await deleteFile(path);
    return 0;
  } catch (err) {
    if (onFailure) onFailure(err);
    return 1;
  }
};

exports.writeGoldensManifest = (manifestPath, test) => {
  manifestPath = `${manifestPath}/manifest`;
  let descs = '';
  descs += getIntialFileName(true) + '\n';
  test.actions.forEach((a,i) => {
    descs += getActionFileName(i, a) + '\n';
  });
  fs.createWriteStream(manifestPath);
  fs.appendFileSync(manifestPath, descs);
};

const _getScreenshotOptions = (path, fileType, clip, quality) => {
  const options = {
    path,
    type: fileType,
    clip: clip
  };
  if (fileType === 'jpeg') options.quality = quality;
  return options;
};

const calcClip = (region, dimensions) => {
  const clip = {};
  clip.x = (region.left || 0);
  clip.y = (region.top || 0);
  if (region.width)
    clip.width = region.width;
  else
    clip.width = (region.right) ? dimensions.width - region.right - clip.x: dimensions.width - clip.x;
  if (region.height)
    clip.height = region.height;
  else
    clip.height = (region.bottom) ? dimensions.height - region.bottom - clip.y: dimensions.height - clip.y;
  return clip;
};

const _optimizeImages = (path, dimensions, clip, fileType) => {
  const w = (clip) ? clip.width : dimensions.width;
  const h = (clip) ? clip.height : dimensions.height;
  const sw = dimensions.scale ? Math.floor(w * dimensions.scale) : w;
  const sh = dimensions.scale ? Math.floor(h * dimensions.scale) : h;
  return optimizeImage(path, {width:sw, height:sh}, fileType);
};