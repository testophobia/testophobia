import sharp from 'sharp';

sharp.cache(false);

/**
 * Resize/scale the image
 *
 * @param {string} path Path to the image file
 * @param {string} dimensions The dimensions to resize the image to
 * @param {string} fileType File extension of the image file
 */
export const optimizeImage = (path, dimensions, fileType) => {
  return sharp(path)
    .resize(dimensions.width, dimensions.height, {
      fastShrinkOnLoad: false
    })
    .toFile(path.replace(`-unscaled.${fileType}`, `.${fileType}`));
};
