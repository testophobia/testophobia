module.exports = {
  testName: 'test2',
  goldens: {
    desktop: ['59U4TdWJX3mZKNdH8mr2CVCwwKPCh.jpeg', '9nLGvMUKhvYNzLezgt.jpeg', 'manifest'],
    mobile: ['59U4TdWJX3mZKNdH8mr2CVCwwKPCh.jpeg', '9nLGvMUKhvYNzLezgt.jpeg', 'manifest']
  },
  dir: './sandbox/tests/site/section1',
  file: 'section1-test.js',
  contents: {
    name: 'section1',
    path: '/index.html',
    actions: [
      {
        description: 'Click the test button',
        type: 'click',
        target: '#btn1'
      }
    ]
  }
};
