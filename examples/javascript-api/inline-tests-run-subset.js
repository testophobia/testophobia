/* global require, */
const {Testophobia} = require('../../lib/Testophobia');

/* This test sets up multiple tests inline, and then runs a single test */
const tp = new Testophobia({
  fileType: "jpeg",
  golden: false,
  baseUrl: 'https://testophobia.github.io',
  tests: [
    {
      name: 'home',
      path: '/testophobia/examples/basic/home/index.html',
      actions: [
        {
          type: 'click',
          target: '#btn'
        }
      ]
    }, {
      name: 'about',
      path: '/testophobia/examples/basic/about/about.html'
    }
  ]
});

tp.run('about');