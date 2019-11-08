const path = require('path');
const mockRequire = require('mock-require');
mockRequire('esm', () => getEsmResult);
mockRequire('meow', () => getMeowResult());
mockRequire('inquirer', {prompt: () => getInquirerResult()});
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

const getInquirerResult = () => {
  return inquirerResult;
};

exports.setUserCfgInUse = inUse => {
  userCfgInUse = inUse;
};

exports.setMeowResult = result => {
  meowResult = {input: ['undefined'], flags: {skipViewer: true}};
  if (result) {
    if (result.input) meowResult.input = result.input;
    meowResult.flags = Object.assign(meowResult.flags, result.flags);
  }
};

exports.setEsmResult = (fileName, result) => {
  esmResults[fileName] = result;
};

exports.setInquirerResult = (result, cb) => {
  inquirerResult = {
    then: async f => {
      await f(result);
      cb();
    }
  };
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

exports.getGenConfig = () => {
  return {
    bail: false,
    verbose: false,
    threshold: 0.2,
    diffDirectory: './testophobia/diffs',
    goldenDirectory: './testophobia/golden-screens',
    testDirectory: './testophobia/test-screens',
    baseUrl: 'http://test.o.phobia',
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
    tests: 'foo/bar/baz*'
  };
};

exports.getGenTest = () => {
  return {
    actions: [],
    name: 'Generated Test',
    path: '/some/generated/test'
  };
};


