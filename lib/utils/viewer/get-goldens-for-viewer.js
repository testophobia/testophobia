import fs from 'fs';
import {glob} from 'glob';
import path from 'path';
import {formatTests} from '../test/format-tests.js';
import Base58 from 'bs58';

/**
 * Get the list of directories containing golden images for the viewer
 *
 * @param {object} config The Testophobia config object
 * @return {array} The golden directories
 */
/* istanbul ignore next */
export const getGoldenDirectoriesForViewer = async config => {
  const tests = await formatTests(config);
  let dirs = findGoldenDirs(path.join(config.goldenDirectory, config.currentBrowser), path.join(config.goldenDirectory, config.currentBrowser));
  let testDir = '';
  if (config.tests) testDir = config.tests.substr(0, config.tests.indexOf('*'));
  dirs = dirs.map(d => {
    const goldenDir = {golden: d};
    const relatedTest = tests.find(t => t.name === d.split(path.sep).pop());
    if (!relatedTest) {
      console.error("Couldn't find test for path: " + d);
    } else {
      if (!relatedTest.testDefinitionPath.startsWith('./')) relatedTest.testDefinitionPath = './' + relatedTest.testDefinitionPath;
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
export const getGoldenImagesForViewer = (config, pathToCheck) => {
  let gldDir;
  const browsers = getBrowsersForViewer(config);
  const dimensions = getDimensionsForViewer(config);
  const images = {};
  const imgResult = browsers.map(b => {
    gldDir = path.join(config.goldenDirectory, b);
    images[b] = findImages(gldDir, path.join(gldDir, pathToCheck), config.fileType);
  });
  return {images, browsers, dimensions};
};

/* istanbul ignore next */
const getDimensionsForViewer = config => {
  return config.dimensions.map(d => d.type);
};

/* istanbul ignore next */
export const getBrowsersForViewer = config => {
  const files = fs.readdirSync(config.goldenDirectory);
  return files.filter(f => ['chromium', 'firefox', 'webkit'].indexOf(f) >= 0);
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
const findImages = (rootDir, pathToCheck, fileType) => {
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
        shortFile: filePath.substr(rootDir.length + 1),
        name: Buffer.from(Base58.decode(fileName)).toString().replace(/-/g, ' ')
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
