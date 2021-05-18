import inquirer from 'inquirer';

const isUnitTest =  process.env.npm_lifecycle_script.startsWith('ava');

export default isUnitTest ? {
  prompt: () => global.mocks.inquirer()
} : inquirer;