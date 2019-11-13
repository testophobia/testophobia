/* global exports, require, __dirname */
const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');

/**
 * Create a directory if it doesn't exist
 *
 * @param {string} directory The path to the directory to create
 */
exports.createDirectory = directory => (!fs.existsSync(directory) ? fs.ensureDirSync(directory) : 0);

/**
 * Delete a directory
 *
 * @param {string} directory The path to the directory to delete
 */
exports.deleteDirectory = directory => new Promise(resolve => fs.remove(directory, resolve));

/**
 * Delete a file
 *
 * @param {string} file The path to the file to delete
 */
exports.deleteFile = file => fs.unlink(file, err => err);

/**
 * Delete a file/directory using a glob path
 *
 * @param {string} globPath The path to the file/dir to delete (with globs)
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
 *
 * @param {string} src The path to the file/dir to be copied
 * @param {string} dest The path to the destination file/dir
 */
exports.copyFileOrDirectory = (src, dest) => fs.copySync(src, dest);

/**
 * Try to locate a file in node_modules, depending on the lib is run (from src vs NPM installed local/global)
 *
 * @param {string} fileToCheck The subpath to attempt a node_modules lookup
 */
exports.resolveNodeModuleFile = fileToCheck => {
  const f = fileToCheck
    .split('/')
    .slice(2)
    .join('/');
  let nodeModulesPath = path.join(__dirname, '../../../../');
  if (fileToCheck && !fs.existsSync(`${nodeModulesPath}/${f}`)) {
    nodeModulesPath = path.join(__dirname, '../../../node_modules/');
  }
  return `${nodeModulesPath}/${f}`;
};
