/* global require, process */
const test = require('ava');
const {config} = require('../common/config');
const path = require('path');
const {getGoldenDirectoriesForViewer, getGoldenImagesForViewer} = require('../../../lib/utils/get-goldens-for-viewer');

const gdConfig = {
  ...config,
  goldenDirectory: path.join(process.cwd(), 'examples/basic/testophobia/golden-screens')
};

test('getGoldenDirectoriesForViewer - no args', t => {
  t.throws(() => getGoldenDirectoriesForViewer());
});

test('getGoldenDirectoriesForViewer - pass config with no golden directory', t => {
  let r = getGoldenDirectoriesForViewer(config);
  t.is(r.length, 0);
});

test('getGoldenDirectoriesForViewer - pass config', t => {
  let r = getGoldenDirectoriesForViewer(gdConfig);
  t.is(r.length > 0, true);
  t.is(r[0], 'desktop/about');
});

test('getGoldenImagesForViewer - no args', t => {
  t.throws(() => getGoldenImagesForViewer());
});

test('getGoldenImagesForViewer - args, wrong path', t => {
  let r = getGoldenImagesForViewer(gdConfig, 'test/path');
  t.is(r.length, 0);
});

test('getGoldenImagesForViewer - args, right path, wrong fileType', t => {
  let r = getGoldenImagesForViewer(gdConfig, 'desktop/about');
  t.is(r.length, 0);
});

test('getGoldenImagesForViewer - args', t => {
  let goodConfig = {...gdConfig, fileType: 'jpeg'};
  let r = getGoldenImagesForViewer(goodConfig, 'desktop/about');
  t.is(r.length > 0, true);
  t.is(Object(r[0]).hasOwnProperty('file'), true);
});
