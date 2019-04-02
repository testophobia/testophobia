/* global exports, require */
const fs = require('fs');
const path = require('path');
const Base58 = require('bs58');

exports.getGoldenImagesForViewer = (config) => {
  const images = [];
  findImages(config.goldenDirectory, new RegExp(`\\.${config.fileType}$`), f => {
    const fileName = f.split(path.sep).pop().split('.')[0];
    images.push({file: f, name:Base58.decode(fileName).toString().replace(/-/g, ' ')});
  });
  return images;
};

const findImages = (pathToCheck, filter, cb) => {
  if (!fs.existsSync(pathToCheck)){
    console.log('Directory not found!', pathToCheck);
    return;
  }
  const files = fs.readdirSync(pathToCheck);
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(pathToCheck, files[i]);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory())
      findImages(filename,filter, cb);
    else if (filter.test(filename))
      cb(filename);
  }
};
