export default {
  testName: 'test3',
  dir: './sandbox/tests/site/section1',
  file: 'section1-test.js',
  contents: {
    name: 'section1',
    path: '/index.html',
    dimensions: [{type: 'desktop', width: 1024, height: 768, scale: 0.8}, {type: 'tablet', width: 375, height: 812, scale: 0.7}],
    excludeDimensions: ['mobile'],
    clipRegions: [{type: 'desktop', width: 800, height: 600}],
    actions: [
      {
        description: 'Click the test button',
        type: 'click',
        target: '#btn1',
        clipRegions: [{type: 'desktop', top: 64, left: 64}]
      },
      {
        description: 'Click the test button',
        type: 'click',
        target: '#btn1',
        clipRegions: [{type: 'desktop', right: 250, bottom: 350}]
      }
    ]
  }
};
