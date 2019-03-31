/* global require, process */
const test = require('ava');
const path = require('path');
const fs = require('fs');
const {cleanFileName, resolveNodeModuleFile, deleteFile, createDirectory, deleteDirectory, getDate, asyncForEach} = require('../../lib/utils');
const {tempPath} = require('../common/config');

const file = `${tempPath}/testfile.txt`;
const dir = `${tempPath}/test-temp-dir`;

const currentdate = new Date();
const date = `${currentdate.getMonth() +
  1}-${currentdate.getDate()}-${currentdate.getFullYear()}_${currentdate.getHours()}-${currentdate.getMinutes()}-${currentdate.getSeconds()}`;
const arr = [1, 2, 3, 4, 5];

test.before(() => {
  fs.writeFileSync(file, 'this is a test file', (err) => {if (err) throw err;});
});

test('getDate', t => {
  let d = getDate();
  t.is(d, date);
});

test('asyncForEach - null', async t => {
  await t.throwsAsync(() => asyncForEach());
});

test('asyncForEach - array', async t => {
  let total = 0;
  await asyncForEach(arr, i => total += i);
  t.is(15, total);
});

test('cleanFileName - null', t => {
  t.is(cleanFileName(null), 0);
});

test('cleanFileName - string', t => {
  t.is(cleanFileName('#some-element.sibling #id'), '-some-element-sibling--id');
});

test('resolveNodeModuleFile - no parameter', t => {
  t.is(resolveNodeModuleFile(), `${path.resolve(process.cwd(), '../')}//`);
});

test('deleteFile - path', async t => {
  await deleteFile(file);
  t.is(fs.existsSync(file), false);
});

test.serial('createDirectory - path', async t => {
  await createDirectory(dir);
  t.is(fs.existsSync(dir), true);
});

test('deleteDirectory - path', async t => {
  await deleteDirectory(dir);
  t.is(fs.existsSync(dir), false);
});