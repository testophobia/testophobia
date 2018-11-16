/* global exports, require */
const fs = require('fs');
const {PNG} = require('pngjs');
const jpeg = require('jpeg-js');

exports.retrieveImageData = (path, fileType) => _readImage(fs.readFileSync(path), fileType);

const _readImage = (img, fileType) => fileType === 'jpeg' ? jpeg.decode(img, true) : PNG.sync.read(img);

