/* global require */
const test = require('ava');
const path = require('path');
const fs = require('fs');
const {generateConfigFile} = require('../../lib/utils/generate-config');
const {tempPath} = require('../common/config');

test.serial('generateConfig', async t => {
  await generateConfigFile(null, tempPath);
  t.is(fs.existsSync(path.join(tempPath, 'testophobia.config.js')), true);
});

test.after('cleanup', () => {
  fs.unlink(path.join(tempPath, 'testophobia.config.js'), () => 0);
});