/* global require, */
const {Testophobia} = require('../../lib/Testophobia');

/* This test sets up multiple tests from a file glob, and then runs a single test */
const tp = new Testophobia({
  fileType: "jpeg",
  golden: false,
  baseUrl: 'https://testophobia.github.io/testophobia/examples/basic',
  tests: 'tests/**/*-test.js'
});

tp.run('tests/about/*-test.js');