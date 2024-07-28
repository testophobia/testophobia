import findConfig from 'find-config';

const isUnitTest =  process.env.PWD && process.env.PWD.endsWith('tests/blackbox');

export default isUnitTest ? {
  obj: () => global.mocks.findConfig()
} : findConfig;