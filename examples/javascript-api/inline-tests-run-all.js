/* global require, */
const {Testophobia} = require('../../lib/Testophobia');

/* This test sets up multiple tests inline, and then runs them all */
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
          description: "Click the button to toggle the text color",
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

tp.run();