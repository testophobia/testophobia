export default {
  testName: 'test4',
  dir: './sandbox/tests/site/section3',
  file: 'section3-test.js',
  contents: {
    name: 'section3',
    path: '/index.html',
    actions: [
      {
        description: 'Scroll the div to 500',
        type: 'scroll',
        target: '#scroll1',
        scrollTop: '500'
      }
    ]
  }
};
