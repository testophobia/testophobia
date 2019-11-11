/* global require, exports */
const fs = require('fs-extra');
const {configDefaults} = require('../config/load-config');
const path = require('path');
const inquirer = require('inquirer');

/**
 * Prompt the user for config/test file paramaters and generate the file
 */
exports.generateConfigFile = async (config, cb, outputDir) => {
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
      when: /* istanbul ignore next */ answers => answers.genFile === 'config'
    },
    {
      type: 'list',
      name: 'fileType',
      message: 'Which image format to use?',
      choices: ['png', 'jpeg'],
      default: configDefaults.fileType,
      when: /* istanbul ignore next */ answers => answers.genFile === 'config'
    },
    {
      type: 'input',
      name: 'testGlob',
      message: 'Test path glob',
      default: 'testophobia/tests/**/*-test.js',
      when: /* istanbul ignore next */ answers => answers.genFile === 'config'
    },
    {
      type: 'input',
      name: 'testName',
      message: 'Test name',
      when: /* istanbul ignore next */ answers => answers.genFile === 'test'
    },
    {
      type: 'input',
      name: 'testPath',
      message: 'Test pathname (url minus origin)',
      when: /* istanbul ignore next */ answers => answers.genFile === 'test'
    },
    {
      type: 'input',
      name: 'testLoc',
      message: 'Test file path',
      when: /* istanbul ignore next */ answers => answers.genFile === 'test',
      default: /* istanbul ignore next */ answers => {
        return config && config.tests ? `${config.tests.substr(0, config.tests.indexOf('*'))}${answers.testName}/${answers.testName}-test.js` : null;
      }
    }
  ];
  inquirer.prompt(prompts).then(async answers => {
    let usePath;
    if (answers.genFile === 'config') {
      usePath = path.resolve(outputDir, `testophobia.config.js`);
      if (fs.existsSync(usePath)) {
        cb('testophobia.config.js already exists!');
        return 1;
      } else {
        const defaults = configDefaults;
        defaults.tests = 'testophobia/tests/**/*-test.js';
        defaults.fileType = answers.fileType;
        defaults.baseUrl = answers.baseUrl;
        defaults.tests = answers.testGlob;
        const contents = `export default ${JSON.stringify(defaults, null, 2)};`;
        await fs.writeFileSync(
          usePath,
          contents,
          /* istanbul ignore next */ err => {
            if (err) throw err;
          }
        );
      }
    } else {
      usePath = path.resolve(outputDir, answers.testLoc);
      if (fs.existsSync(usePath)) {
        cb('test file already exists!');
        return 1;
      } else {
        await fs.ensureDirSync(path.dirname(usePath));
        const testDef = {
          name: answers.testName,
          path: answers.testPath,
          actions: []
        };
        const contents = `export default ${JSON.stringify(testDef, null, 2)};`;
        await fs.writeFileSync(
          usePath,
          contents,
          /* istanbul ignore next */ err => {
            if (err) throw err;
          }
        );
      }
    }
    cb(`${path.relative(outputDir, usePath)} created.`);
  });
  return 1;
};
