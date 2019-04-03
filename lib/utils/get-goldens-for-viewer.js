/* global exports, require */
const fs = require('fs');
const path = require('path');
const Base58 = require('bs58');

exports.getGoldenImagesForViewer = (config) => {
  const dir = (config.cliPath) ? config.cliPath : config.goldenDirectory;
  return findImages(dir, config.fileType);
};

const findImages = (pathToCheck, fileType) => {
  if (!fs.existsSync(pathToCheck)){
    console.log('Directory not found!', pathToCheck);
    return [];
  }
  let images = [];
  let childImages = [];
  const files = fs.readdirSync(pathToCheck);
  for (let i = 0; i < files.length; i++) {
    let filePath = path.join(pathToCheck, files[i]);
    const stat = fs.lstatSync(filePath);
    const filter = new RegExp(`\\.${fileType}$`);
    if (stat.isDirectory()) {
      childImages = childImages.concat(findImages(filePath, fileType));
    } else if (filter.test(filePath)) {
      const fileName = filePath.split(path.sep).pop().split('.')[0];
      images.push({file: filePath, fileName: fileName, name:Base58.decode(fileName).toString().replace(/-/g, ' ')});
    }
  }
  const manifestPath = path.join(pathToCheck, 'manifest');
  if (fs.existsSync(manifestPath)) {
    let manifest = fs.readFileSync(manifestPath).toString();
    let sorted = [];
    manifest.split('\n').forEach(m => {
      images.forEach(i => {
        if (i.fileName === m) {
          sorted.push(i);
        }
      });
    });
    images = sorted;
  }
  return images.concat(childImages);
};
