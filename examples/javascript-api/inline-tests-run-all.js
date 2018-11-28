/* global require, */
const {Testophobia} = require('../../lib/Testophobia');

/* This test sets up multiple tests inline, and then runs them all */
const tp = new Testophobia({
  fileType: "jpeg",
  golden: false,
  baseUrl: 'https://testophobia.github.io/testophobia/examples/basic',
  tests: [
    {
      name: 'home',
      path: 'home/index.html',
      actions: [
        {
          type: 'click',
          target: '#btn'
        }
      ]
    }, {
      name: 'about',
      path: 'about/about.html'
    }
  ]
});

tp.run();