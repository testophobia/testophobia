/* global require, process */
const path = require('path');
const {createDirectory} = require('../../lib/utils');

createDirectory(path.resolve(process.cwd(), 'tests/temp'));