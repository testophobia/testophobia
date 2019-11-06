module.exports = {
  testName: 'test3',
  goldens: {
    desktop: ['59U4TdWJX3mZKNdH8mr2CVCwwKPCh.png', '9nLGvMUKhvYNzLezgt.png', 'A7XoTca2HGSnm6tsdvL6QH9zSJvghGT9oxAMj.png', 'manifest'],
    mobile: []
  },
  dir: './sandbox/tests/site/section1',
  file: 'section1-test.js',
  contents: {
    name: 'section1',
    path: '/index.html',
    dimensions: [{type: 'desktop', width: 1024, height: 768, scale: 0.8}, {type: 'mobile', width: 375, height: 812, scale: 0.7}],
    excludeDimensions: ['mobile'],
    clipRegions: [{type: 'desktop', width: 800, height: 600}],
    actions: [
      {
        description: 'Click the test button',
        type: 'click',
        target: '#btn1',
        clipRegions: [{type: 'desktop', top: 200, left: 300}]
      },
      {
        description: 'Click the test button again',
        type: 'click',
        target: '#btn1',
        clipRegions: [{type: 'desktop', right: 250, bottom: 350}]
      }
    ]
  }
};
