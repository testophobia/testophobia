/* global exports, require */
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const {asyncForEach} = require('../');
const {readTestFileToObject} = require('../test/format-tests');
const Base58 = require('bs58');

/**
 * Get the list of directories containing golden images for the viewer
 *
 * @param {object} config The Testophobia config object
 * @return {array} The golden directories
 */
/* istanbul ignore next */
exports.getGoldenDirectoriesForViewer = async config => {
  let dirs = findGoldenDirs(config.goldenDirectory, config.goldenDirectory);
  let testPaths;
  typeof config.tests === 'string'
    ? (testPaths = await glob.sync(config.tests))
    : await asyncForEach(config.tests, async t => {
        const tp = await glob.sync(t);
        tp.forEach(t => testPaths.push(t));
      });
  dirs = dirs.map(async d => {
    const goldenDir = {golden: d};
    await asyncForEach(testPaths, t => {
      const file = readTestFileToObject(t);
      // if (d.indexOf('no-member' >= 0)) {
      //   console.dir('test: ' + file.default.name);
      //   console.dir('golden: ' + d.split(path.sep).pop());
      //   console.dir('match: ' + Boolean(file.default.name === d.split(path.sep).pop()));
      // }
      if (file.default.name === d.split(path.sep).pop()) {
        goldenDir.test = file.default.name;
      }
    });
    console.dir(goldenDir);
    return d;
  });
  return dirs;
};

/**
 * Get the list of golden images within a directory for the viewer
 *
 * @param {object} config The Testophobia config object
 * @param {string} pathToCheck Path to check for golden images
 * @return {array} The golden images
 */
/* istanbul ignore next */
exports.getGoldenImagesForViewer = (config, pathToCheck) => {
  return findImages(path.join(config.goldenDirectory, pathToCheck), config.fileType);
};

/* istanbul ignore next */
const findGoldenDirs = (pathToCheck, goldenDir) => {
  if (!fs.existsSync(pathToCheck)) {
    console.log('Directory not found!', pathToCheck);
    return [];
  }
  const dirs = [];
  let childDirs = [];
  if (fs.existsSync(path.join(pathToCheck, 'manifest'))) {
    dirs.push(path.relative(goldenDir, pathToCheck));
  } else {
    const files = fs.readdirSync(pathToCheck);
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(pathToCheck, files[i]);
      const stat = fs.lstatSync(filePath);
      if (stat.isDirectory()) {
        childDirs = childDirs.concat(findGoldenDirs(filePath, goldenDir));
      }
    }
  }
  return dirs.concat(childDirs);
};

/* istanbul ignore next */
const findImages = (pathToCheck, fileType) => {
  if (!fs.existsSync(pathToCheck)) {
    console.log('Directory not found!', pathToCheck);
    return [];
  }
  let images = [];
  const files = fs.readdirSync(pathToCheck);
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(pathToCheck, files[i]);
    const stat = fs.lstatSync(filePath);
    const filter = new RegExp(`\\.${fileType}$`);
    if (!stat.isDirectory() && filter.test(filePath)) {
      const fileName = filePath
        .split(path.sep)
        .pop()
        .split('.')[0];
      images.push({
        file: filePath,
        fileName: fileName,
        name: Base58.decode(fileName)
          .toString()
          .replace(/-/g, ' ')
      });
    }
  }
  const manifestPath = path.join(pathToCheck, 'manifest');
  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath).toString();
    const sorted = [];
    manifest.split('\n').forEach(m => {
      images.forEach(i => {
        if (i.fileName === m) {
          sorted.push(i);
        }
      });
    });
    images = sorted;
  }
  return images;
};
