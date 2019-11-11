/* global exports, require, __dirname */
const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');

/**
 * Create a directory if it doesn't exist
 */
exports.createDirectory = directory => (!fs.existsSync(directory) ? fs.ensureDirSync(directory) : 0);

/**
 * Delete a directory
 */
exports.deleteDirectory = directory => new Promise(resolve => fs.remove(directory, resolve));

/**
 * Delete a file
 */
exports.deleteFile = file => fs.unlink(file, err => err);

/**
 * Delete a file/directory using a glob path
 */
exports.deleteGlob = async globPath => {
  const paths = await glob.sync(globPath);
  paths.forEach(p => {
    if (fs.statSync(p).isDirectory()) exports.deleteDirectory(p);
    else exports.deleteFile(p);
  });
};

/**
 * Copy a file/directory to another destination (recursive)
 */
exports.copyFileOrDirectory = (src, dest) => fs.copySync(src, dest);

/**
 * Try to locate a file in node_modules, depending on the lib is run (from src vs NPM installed local/global)
 */
exports.resolveNodeModuleFile = fileToCheck => {
  let f = fileToCheck
    .split('/')
    .slice(2)
    .join('/');
  let nodeModulesPath = path.join(__dirname, '../../../../');
  if (fileToCheck && !fs.existsSync(`${nodeModulesPath}/${f}`)) {
    nodeModulesPath = path.join(__dirname, '../../../node_modules/');
  }
  return `${nodeModulesPath}/${f}`;
};
