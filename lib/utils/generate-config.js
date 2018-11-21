/* global require, exports */
const fs = require('fs');
const {configDefaults} = require('./load-config');

exports.generateConfigFile = async (cb = false) => {
  try {
    fs.accessSync('testophobia.config.js');
  } catch (e) {
    const defaults = configDefaults;
    defaults.tests = [{name: 'home', path: null, delay: null, actions: []}];
    const contents = `export default ${JSON.stringify(defaults, null, 2)};`;
    await fs.writeFileSync('testophobia.config.js', contents, (err) => {if (err) throw err;});
  }
  if (cb) await cb();
  return 0;
};