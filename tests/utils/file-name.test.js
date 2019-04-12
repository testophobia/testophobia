/* global require */
const test = require('ava');
const {exampleAction} = require('../common/config');
const {getIntialFileName, getActionFileName} = require('../../lib/utils/file-name');

test('getIntialFileName - no args (unscaled)', t => {
  let r = getIntialFileName();
  t.is(r, '9nLGvMUKhvYNzLezgt-unscaled');
});

test('getIntialFileName - args', t => {
  let r = getIntialFileName('file-test');
  t.is(r, '9nLGvMUKhvYNzLezgt');
});

test('getActionFileName - no args', t => {
  t.throws(() => getActionFileName());
});

test('getActionFileName - args, skip encoding', t => {
  let r = getActionFileName(0, exampleAction);
  t.is(r, 'ujNWfBbJHh3dJEx8');
});

test('getActionFileName - args, include encoding', t => {
  let r = getActionFileName(0, exampleAction, true);
  t.is(r, '0-click-body');
});
