const path = require('path');
const mockRequire = require('mock-require');
mockRequire('esm', () => getEsmResult);
mockRequire('meow', () => getMeowResult());
mockRequire('find-config', {obj: () => getFindConfigResult()});

const esmResults = {};
let meowResult;
let userCfgInUse = false;

const getEsmResult = esmPath => {
  const esmResult = esmResults[esmPath];
  if (esmResult instanceof Error) {
    throw esmResult;
  }
  return esmResult;
};

const getMeowResult = () => {
  return meowResult;
};

const getFindConfigResult = () => {
  if (!userCfgInUse) return;
  const userCfg = './sandbox';
  esmResults['sandbox/.testophobia.config.js'] = {
    default: {
      threshold: 0.5,
      fileType: 'png'
    }
  };
  return {dir: userCfg};
};

exports.setUserCfgInUse = inUse => {
  userCfgInUse = inUse;
};

exports.setMeowResult = result => {
  meowResult = {input: ['undefined'], flags: {skipViewer: true}};
  meowResult = Object.assign(meowResult, result);
};

exports.setEsmResult = (fileName, result) => {
  esmResults[fileName] = result;
};

exports.getConfig = () => {
  return {
    bail: false,
    verbose: false,
    threshold: 0.2,
    diffDirectory: './sandbox/diffs',
    goldenDirectory: './sandbox/golden-screens',
    testDirectory: './sandbox/test-screens',
    baseUrl: 'http://localhost:8081',
    fileType: 'jpeg',
    defaultTime: 2068786800000,
    quality: 80,
    dimensions: [
      {
        type: 'desktop',
        width: 1024,
        height: 768
      },
      {
        type: 'mobile',
        width: 375,
        height: 812
      }
    ],
    tests: 'sandbox/tests/**/*-test.js'
  };
};
