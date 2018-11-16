/* global exports, require */
const fs = require('fs');
const mkdirp = require('mkdirp');

exports.createDirectory = path => !fs.existsSync(path) ? mkdirp(path) : false;