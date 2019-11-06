module.exports = {
  testName: 'test4',
  goldens: {
    desktop: ['68QYAofHU1722wHWMk1tpTNGi6gb9.jpeg', '9nLGvMUKhvYNzLezgt.jpeg', 'manifest'],
    mobile: ['68QYAofHU1722wHWMk1tpTNGi6gb9.jpeg', '9nLGvMUKhvYNzLezgt.jpeg', 'manifest']
  },
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
