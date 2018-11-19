/* global require, exports */
const fs = require('fs');
const {configDefaults} = require('./load-config');

exports.generateConfigFile = () => {
  try {
    fs.accessSync('testophobia.config.js');
  } catch (e) {
    const defaults = configDefaults;
    defaults.tests = [{name: 'home', path: null, delay: null, actions: []}];
    const contents = `export default ${JSON.stringify(defaults, null, 2)};`;
    fs.writeFileSync('testophobia.config.js', contents, (err) => {if (err) throw err;});
    return 1;
  }
  return 0;
};