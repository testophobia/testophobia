module.exports = {
  testName: 'test5',
  dir: './sandbox/tests/site/section2',
  file: 'section2-test.js',
  contents: {
    name: 'section2',
    path: '/index.html',
    actions: [
      {
        description: 'Click the choose file button',
        type: 'triggerOpenFileDialog',
        target: '#input2',
        filePath: 'sandbox/files/testfile.json',
        delay: 500
      },
      {
        description: 'Drag the drag image (desktop)',
        type: 'drag',
        target: '#drag1',
        x: 170,
        excludeDimensions: ['mobile']
      },
      {
        description: 'Drag the drag image (mobile)',
        type: 'drag',
        target: '#drag1',
        y: 170,
        excludeDimensions: ['desktop']
      }
    ]
  }
};
