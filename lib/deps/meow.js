import meow from 'meow';

const isUnitTest =  process.env.npm_lifecycle_script && process.env.npm_lifecycle_script.startsWith('ava');

export default isUnitTest ? function() {
  return global.mocks.meow();
} : meow;