/* global require */
const test = require('ava');
const path = require('path');
const fs = require('fs');
const {generateResultFile} = require('../../../lib/utils/generate-result-file');
const {tempPath, config} = require('../common/config');

const resultConfig = {
  ...config,
  diffDirectory: tempPath
};

const results = {
  tests: 'generate-result-file.test.js',
  failures: 'none'
};

test('generateResultFile - null', t => {
  t.throws(() => generateResultFile());
});

test('generateResultFile', async t => {
  await generateResultFile(resultConfig, results);
  t.is(fs.existsSync(path.join(resultConfig.diffDirectory, 'results.json')), true);
});

test.after('cleanup', async () => {
  await fs.unlink(path.join(resultConfig.diffDirectory, 'results.json'), () => 0);
});
