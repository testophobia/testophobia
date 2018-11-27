/* global require */
const test = require('ava');
const path = require('path');
const fs = require('fs');
const {generateResultFile} = require('../../lib/utils/generate-result-file');
const {tempPath} = require('../common/temp-path');

const config = {
  diffDirectory: tempPath,
  quality: 'png',
  threshold: 0.2,
  baseUrl: 'http://test.com',
  dimensions: {
    desktop: {
      height: 300,
      width: 200
    }
  }
};

const results = {
  tests: "generate-result-file.test.js",
  failures: "none"
};

test('generateResultFile - null', t => {
  t.throws(() => generateResultFile());
});

test('generateResultFile', async t => {
  await generateResultFile(config, results);
  t.is(fs.existsSync(path.join(config.diffDirectory, 'results.json')), true);
});

test.after('cleanup', async () => {
  await fs.unlink(path.join(config.diffDirectory, 'results.json'), () => 0);
});