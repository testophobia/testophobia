/* global require */
const test = require('ava');
const path = require('path');
const fs = require('fs');
const {mocki} = require('../common/inquirer-mock');
const {generateConfigFile} = require('../../../lib/utils/generate-config');
const {tempPath} = require('../common/config');

test.serial('generateConfig - config option', async t => {
  mocki({
    genFile: 'config'
  });
  const answers = await generateConfigFile(null, null, tempPath);
  t.is(answers, 1);
  t.is(fs.existsSync(path.join(tempPath, 'testophobia.config.js')), true);
});

test.serial('generateConfig - test option', async t => {
  mocki({
    genFile: 'test',
    testName: 'unit-check',
    testLoc: `${tempPath}/unit-check.test.js`,
    testPath: '/unit-check'
  });
  const answers = await generateConfigFile();
  t.is(answers, 1);
  t.is(fs.existsSync(path.join(tempPath, 'unit-check.test.js')), true);
});

test.after('cleanup', () => {
  fs.unlink(path.join(tempPath, 'testophobia.config.js'), () => 0);
  fs.unlink(path.join(tempPath, 'unit-check.test.js'), () => 0);
});
