module.exports = {
  testName: 'test3',
  dir: './sandbox/tests/site/home',
  file: 'home-test.js',
  contents: {
    name: 'home',
    path: '/index.html',
    excludeDimensions: ['mobile'],
    clipRegions: [{type: 'desktop', width: 800, height: 600}],
    actions: [
      {
        description: 'Scroll page to 500',
        type: 'scroll',
        target: 'html',
        scrollTop: '500',
        clipRegions: [{type: 'desktop', width: 640, height: 480}]
      }
    ]
  }
};
