/* global require */
const test = require('ava');
const {cleanTargetName} = require('../lib/utils');

test('cleanTargetName - null', t => {
  t.is(cleanTargetName(null), 0);
});

test('cleanTargetName - string', t => {
  t.is(cleanTargetName('#some-element.sibling#id'), '-some-element-sibling-id');
});