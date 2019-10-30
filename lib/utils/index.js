/* global exports, require, __dirname */
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

exports.getDate = () => {
  const currentdate = new Date();
  return `${currentdate.getMonth() +
    1}-${currentdate.getDate()}-${currentdate.getFullYear()}_${currentdate.getHours()}-${currentdate.getMinutes()}-${currentdate.getSeconds()}`;
};

exports.asyncForEach = async (arr, cb) => {
  for (let i = 0; i < arr.length; i++) {
    await cb(arr[i], i, arr);
  }
};

exports.resolveNodeModuleFile = (fileToCheck = '') => {
  let f = fileToCheck
    .split('/')
    .slice(2)
    .join('/');
  let nodeModulesPath = path.join(__dirname, '../../../');
  if (fileToCheck && !fs.existsSync(`${nodeModulesPath}/${f}`)) {
    nodeModulesPath = path.join(__dirname, '../../node_modules/');
  }
  return `${nodeModulesPath}/${f}`;
};

exports.cleanFileName = s => {
  if (!s) return 0;
  return s.replace(/ /g, '-').replace(/[`~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/g, '-'); //eslint-disable-line no-useless-escape
};

const _deleteFile = file => fs.unlink(file, err => err);

const _deleteDirectory = directory => new Promise(resolve => rimraf(directory, resolve));

exports.deleteGlob = async globPath => {
  const paths = await glob.sync(globPath);
  paths.forEach(p => {
    if (fs.statSync(p).isDirectory()) _deleteDirectory(p);
    else _deleteFile(p);
  });
};

exports.createDirectory = directory => (!fs.existsSync(directory) ? mkdirp.sync(directory) : false);

exports.deleteFile = _deleteFile;

exports.deleteDirectory = _deleteDirectory;
