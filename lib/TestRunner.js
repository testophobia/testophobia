/* global exports */
'use strict';

exports.TestRunner = class TestRunner {
  constructor(path = false) {
    this.path = path;
  }

  run() {
    console.log('i run');
  }

};