import meow from 'meow';

const isUnitTest = process.env.PWD && process.env.PWD.endsWith('tests/blackbox');

export default isUnitTest ? function() {
  return global.mocks.meow();
} : meow;