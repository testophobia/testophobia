/* global require, exports */
const fs = require('fs');
const {configDefaults} = require('./load-config');
const path = require('path');

exports.generateConfigFile = async (cb = false, dir = '') => {
  let usePath = path.resolve(dir, `testophobia.config.js`);
  try {
    fs.accessSync(usePath);
  } catch (e) {
    const defaults = configDefaults;
    defaults.tests = 'testophobia/tests/**/*-test.js';
    const contents = `export default ${JSON.stringify(defaults, null, 2)};`;
    await fs.writeFileSync(usePath, contents, (err) => {if (err) throw err;});
  }
  if (cb) await cb();
  return 1;
};