import findConfig from 'find-config';

const isUnitTest =  process.env.npm_lifecycle_script.startsWith('ava');

export default isUnitTest ? {
  obj: () => global.mocks.findConfig()
} : findConfig;