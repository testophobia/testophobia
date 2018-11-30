/* global require, */
const {Testophobia} = require('../../lib/Testophobia');

/* This test sets up multiple tests from a file glob, and then runs them all */
const tp = new Testophobia({
  fileType: "jpeg",
  golden: false,
  baseUrl: 'https://testophobia.github.io',
  tests: 'tests/**/*-test.js'
});

tp.run();