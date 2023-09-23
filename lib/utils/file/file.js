import path from 'path';
import {glob} from 'glob';
import fs from 'fs-extra';
const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);

/**
 * Create a directory if it doesn't exist
 *
 * @param {string} directory The path to the directory to create
 */
export const createDirectory = directory => (!fs.existsSync(directory) ? fs.ensureDirSync(directory) : 0);

/**
 * Delete a directory
 *
 * @param {string} directory The path to the directory to delete
 */
export const deleteDirectory = directory => new Promise(resolve => fs.remove(directory, resolve));

/**
 * Delete a file
 *
 * @param {string} file The path to the file to delete
 */
export const deleteFile = file => fs.unlink(file, err => err);

/**
 * Delete a file/directory using a glob path
 *
 * @param {string} globPath The path to the file/dir to delete (with globs)
 */
export const deleteGlob = async globPath => {
  const paths = await glob.sync(globPath);
  paths.forEach(p => {
    if (fs.statSync(p).isDirectory()) deleteDirectory(p);
    else deleteFile(p);
  });
};

/**
 * Copy a file/directory to another destination (recursive)
 *
 * @param {string} src The path to the file/dir to be copied
 * @param {string} dest The path to the destination file/dir
 */
export const copyFileOrDirectory = (src, dest) => fs.copySync(src, dest);

/**
 * Try to locate a file in node_modules, depending on the lib is run (from src vs NPM installed local/global)
 *
 * @param {string} fileToCheck The subpath to attempt a node_modules lookup
 */
export const resolveNodeModuleFile = fileToCheck => {
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
