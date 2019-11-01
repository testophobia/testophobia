/* global require, exports */
const fs = require('fs-extra');
const {configDefaults} = require('./load-config');
const path = require('path');
const inquirer = require('inquirer');

exports.generateConfigFile = async (config, cb = false, dir = '') => {
  const prompts = [
    {
      type: 'list',
      name: 'genFile',
      message: 'Which type of file to generate?',
      choices: ['config', 'test'],
      default: 'config'
    },
    {
      type: 'input',
      name: 'baseUrl',
      message: 'Enter baseUrl (origin only)',
      default: configDefaults.baseUrl,
      when: answers => answers.genFile === 'config'
    },
    {
      type: 'list',
      name: 'fileType',
      message: 'Which image format to use?',
      choices: ['png', 'jpeg'],
      default: configDefaults.fileType,
      when: answers => answers.genFile === 'config'
    },
    {
      type: 'input',
      name: 'testGlob',
      message: 'Test path glob',
      default: 'testophobia/tests/**/*-test.js',
      when: answers => answers.genFile === 'config'
    },
    {
      type: 'input',
      name: 'testName',
      message: 'Test name',
      when: answers => answers.genFile === 'test'
    },
    {
      type: 'input',
      name: 'testPath',
      message: 'Test pathname (url minus origin)',
      when: answers => answers.genFile === 'test'
    },
    {
      type: 'input',
      name: 'testLoc',
      message: 'Test file path',
      when: answers => answers.genFile === 'test',
      default: answers => {
        return config && config.tests ? `${config.tests.substr(0, config.tests.indexOf('*'))}${answers.testName}/${answers.testName}-test.js` : null;
      }
    }
  ];

  await inquirer.prompt(prompts).then(async answers => {
    let usePath;
    if (answers.genFile === 'config') {
      usePath = path.resolve(dir, `testophobia.config.js`);
      try {
        fs.accessSync(usePath);
      } catch (e) {
        const defaults = configDefaults;
        defaults.tests = 'testophobia/tests/**/*-test.js';
        defaults.fileType = answers.fileType;
        defaults.baseUrl = answers.baseUrl;
        defaults.tests = answers.testGlob;
        const contents = `export default ${JSON.stringify(defaults, null, 2)};`;
        await fs.writeFileSync(usePath, contents, err => {
          if (err) throw err;
        });
      }
    } else {
      usePath = path.resolve(dir, answers.testLoc);
      try {
        fs.accessSync(usePath);
      } catch (e) {
        await fs.ensureDirSync(path.dirname(usePath));
        const testDef = {
          name: answers.testName,
          path: answers.testPath,
          actions: []
        };
        const contents = `export default ${JSON.stringify(testDef, null, 2)};`;
        await fs.writeFileSync(usePath, contents, err => {
          if (err) throw err;
        });
      }
    }
    if (cb) await cb(usePath);
  });
  return 1;
};
