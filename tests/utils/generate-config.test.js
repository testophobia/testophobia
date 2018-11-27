/* global require, process */
const test = require('ava');
const path = require('path');
const fs = require('fs');
const {generateConfigFile} = require('../../lib/utils/generate-config');

const tempDir = `${process.cwd()}/tests/temp`;

test.serial('generateConfig', async t => {
  await generateConfigFile(null, tempDir);
  t.is(fs.existsSync(path.join(tempDir, 'testophobia.config.js')), true);
});

test.after('cleanup', () => {
  fs.unlink(path.join(tempDir, 'testophobia.config.js'), () => 0);
});