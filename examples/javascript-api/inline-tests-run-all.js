const {Testophobia} = require('../../lib/testophobia');

/* This test sets up multiple tests inline, and then runs them all */
const tp = new Testophobia({
  fileType: "jpeg",
  golden: false,
  baseUrl: 'https://testophobia.github.io/testophobia/examples/basic',
  tests: [
    {
      name: 'home',
      actions: [
        {
          type: 'click',
          target: '#btn'
        }
      ]
    },{
      name: 'about'
    }
  ]
});

tp.run();