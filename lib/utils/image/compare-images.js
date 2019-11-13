/* global exports, require */
const pixelmatch = require('pixelmatch');
const {PNG} = require('pngjs');

/**
 * Compare to two images and determine if they're a match (within a threshold)
 *
 * @param {object} img1 The image data to compare to img2
 * @param {object} img2 The image data to compare to img1
 * @param {number} threshold The tolerance threshold to use for comparison
 * @return {number} The pixel difference in the two images
 */
exports.compareScreenshots = (img1, img2, threshold) => {
  if (img1.width !== img2.width || img1.height !== img2.height) return -1;
  const diff = new PNG({width: img1.width, height: img1.height});
  const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {threshold: threshold});
  return numDiffPixels ? {numDiffPixels, diff} : 0;
};
