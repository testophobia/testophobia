/* global exports, require */
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const {formatTests} = require('../test/format-tests');
const Base58 = require('bs58');

/**
 * Get the list of directories containing golden images for the viewer
 *
 * @param {object} config The Testophobia config object
 * @return {array} The golden directories
 */
/* istanbul ignore next */
exports.getGoldenDirectoriesForViewer = async config => {
  const tests = await formatTests(config);
  let dirs = findGoldenDirs(config.goldenDirectory, config.goldenDirectory);
  let testDir = '';
  if (config.tests) testDir = config.tests.substr(0, config.tests.indexOf('*'));
  dirs = dirs.map(d => {
    const goldenDir = {golden: d};
    const relatedTest = tests.find(t => t.name === d.split(path.sep).pop());
    if (!relatedTest) {
      console.error("Couldn't find test for path: " + path);
    } else {
      goldenDir.test = relatedTest.testDefinitionPath;
      goldenDir.testCategory = path.dirname(relatedTest.testDefinitionPath).substr(testDir.length);
    }
    return goldenDir;
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
      const fileName = filePath.split(path.sep).pop().split('.')[0];
      images.push({
        file: filePath,
        fileName: fileName,
        name: Base58.decode(fileName).toString().replace(/-/g, ' ')
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
