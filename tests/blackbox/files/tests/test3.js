module.exports = {
  testName: 'test3',
  goldens: {
    desktop: ['4Tc5tHFf96q46SVjWdvi5Ltby.png', '9nLGvMUKhvYNzLezgt.png', 'GGRrZLjhLkj6f1Xpdoz4J4rpDd.png', 'manifest'],
    mobile: []
  },
  dir: './sandbox/tests/site/home',
  file: 'home-test.js',
  contents: {
    name: 'home',
    path: '/index.html',
    dimensions: [{type: 'desktop', width: 1024, height: 768, scale: 0.8}, {type: 'mobile', width: 375, height: 812, scale: 0.7}],
    excludeDimensions: ['mobile'],
    clipRegions: [{type: 'desktop', width: 800, height: 600}],
    actions: [
      {
        description: 'Scroll page to 500',
        type: 'scroll',
        target: 'html',
        scrollTop: '500',
        clipRegions: [{type: 'desktop', top: 200, left: 300}]
      },
      {
        description: 'Scroll page to 1000',
        type: 'scroll',
        target: 'html',
        scrollTop: '1000',
        clipRegions: [{type: 'desktop', right: 250, bottom: 350}]
      }
    ]
  }
};
