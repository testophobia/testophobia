/* global require, process */
const test = require('ava');
const path = require('path');
const fs = require('fs');
const {generateConfigFile} = require('../lib/utils/generate-config');

test('generateConfig', async t => {
  await generateConfigFile();
  t.is(fs.existsSync(path.join(process.cwd(), 'testophobia.config.js')), true);
});

test.after('cleanup', () => {
  fs.unlink(path.join(process.cwd(), 'testophobia.config.js'), () => console.log('Test file deleted'));
});