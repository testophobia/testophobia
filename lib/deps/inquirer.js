import inquirer from 'inquirer';

const isUnitTest =  process.env.PWD && process.env.PWD.endsWith('tests/blackbox');

export default isUnitTest ? {
  prompt: () => global.mocks.inquirer()
} : inquirer;