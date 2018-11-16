/* global exports, require, __dirname */

const path = require('path');
const fs = require('fs');

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

exports.resolveNodeModuleFile = (fileToCheck = "") => {
  let f = fileToCheck.split('/').slice(2).join('/');
  let nodeModulesPath = path.join(__dirname, "../../../");
  if
  (fileToCheck && !fs.existsSync(`${nodeModulesPath}/${f}`)) {
    nodeModulesPath = path.join(__dirname, "../../node_modules/");
  }
  return `${nodeModulesPath}/${f}`;
};

exports.cleanTargetName = s => {
  return s
    .replace(/ /g, '-')
    .replace(/[`~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/g, '-'); //eslint-disable-line no-useless-escape
};