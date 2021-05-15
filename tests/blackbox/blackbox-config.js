import path from 'path';
import mockRequire from 'mock-require';
mockRequire('meow', () => getMeowResult());
mockRequire('inquirer', {prompt: () => getInquirerResult()});
mockRequire('find-config', {obj: () => getFindConfigResult()});

const bbconfig = {};
const esmResults = {};
let meowResult;
let userCfgInUse = false;

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

bbconfig.setUserCfgInUse = inUse => {
  userCfgInUse = inUse;
};

bbconfig.setMeowResult = result => {
  meowResult = {input: ['undefined'], flags: {skipViewer: true}};
  if (result) {
    if (result.input) meowResult.input = result.input;
    meowResult.flags = Object.assign(meowResult.flags, result.flags);
  }
};

bbconfig.setEsmResult = (fileName, result) => {
  esmResults[fileName] = result;
};

bbconfig.setInquirerResult = (result, cb) => {
  inquirerResult = {
    then: async f => {
      await f(result);
      cb();
    }
  };
};

bbconfig.getConfig = () => {
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

bbconfig.getGenConfig = () => {
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

bbconfig.getGenTest = () => {
  return {
    actions: [],
    name: 'Generated Test',
    path: '/some/generated/test'
  };
};

export default bbconfig;

