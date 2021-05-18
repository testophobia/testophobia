import fs from 'fs';
import {deleteFile} from '../file/file.js';
import {optimizeImage} from '../image/optimize-image.js';
import {getActionFileName, getIntialStateFileName} from '../file/file-name.js';

/**
 * Take a screenshot of the active browser page, resize as nec, and write to disk
 *
 * @param {string} path Path to resulting screenshot
 * @param {object} dimensions The dimensions to use for the screenshot
 * @param {object} clipRegion The clip region to apply to the screenshot
 * @param {string} fileType The type of image file to use
 * @param {Browser} browser The Browser class reference
 * @param {number} quality For jpeg files, the quality of the image (compression)
 * @param {function} onFailure The failure callback function
 */
export const generateScreenshot = async (path, dimensions, clipRegion, fileType, browser, quality, onFailure) => {
  try {
    let clip;
    if (clipRegion) clip = _calcClip(clipRegion, dimensions);
    await browser.screenshot(_getScreenshotOptions(path, fileType, clip, quality));
    await _optimizeImages(path, dimensions, clip, fileType);
    await deleteFile(path);
    return 0;
  } catch (err) {
    /* istanbul ignore next */
    if (onFailure) onFailure(err);
  }
};

/**
 * Write the manifest file for a given test
 *
 * @param {string} manifestPath Directory containing the manifest file
 * @param {object} test The test that corresponds to the manifest file
 */
export const writeGoldensManifest = (manifestPath, test) => {
  manifestPath = `${manifestPath}/manifest`;
  let descs = '';
  descs += getIntialStateFileName(true) + '\n';
  if (test.actions && test.actions.length) {
    test.actions.forEach((a, i) => {
      descs += getActionFileName(i, a) + '\n';
    });
  }
  fs.writeFileSync(manifestPath, descs);
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

const _calcClip = (region, dimensions) => {
  const clip = {};
  clip.x = region.left || 0;
  clip.y = region.top || 0;
  if (region.width) clip.width = region.width;
  else clip.width = region.right ? dimensions.width - region.right - clip.x : dimensions.width - clip.x;
  if (region.height) clip.height = region.height;
  else clip.height = region.bottom ? dimensions.height - region.bottom - clip.y : dimensions.height - clip.y;
  return clip;
};

const _optimizeImages = (path, dimensions, clip, fileType) => {
  const w = clip ? clip.width : dimensions.width;
  const h = clip ? clip.height : dimensions.height;
  const sw = dimensions.scale ? Math.floor(w * dimensions.scale) : w;
  const sh = dimensions.scale ? Math.floor(h * dimensions.scale) : h;
  return optimizeImage(path, {width: sw, height: sh}, fileType);
};
