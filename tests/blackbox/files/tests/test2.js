module.exports = {
  testName: 'test2',
  dir: './sandbox/tests/site/section1',
  file: 'section1-test.js',
  contents: {
    name: 'section1',
    path: '/index.html',
    actions: [
      {
        description: 'Click the test button',
        type: 'click',
        target: '#btn1',
        hideMouse: true
      },
      {
        description: 'Wait for the test button to reset',
        type: 'delay',
        target: '#btn1',
        delay: 2200
      },
      {
        description: 'Hover the test button',
        type: 'hover',
        target: '#btn1'
      },
      {
        description: 'Input text into the textbox',
        type: 'input',
        value: 'Test text',
        target: '#input1'
      },
      {
        description: 'Replace the text in the textbox',
        type: 'input',
        value: 'Replaced',
        target: '#input1',
        replace: true
      },
      {
        description: 'Trigger keypress handler on the input',
        type: 'keypress',
        key: '?',
        target: '#input1'
      },
      {
        description: 'Clear the input',
        type: 'clearInput',
        target: '#input1'
      },
      {
        description: 'Set the input bg color via attribute',
        type: 'setAttribute',
        attribute: 'style',
        value: 'background-color:red',
        target: '#input1'
      },
      {
        description: 'Remove the input attribute',
        type: 'removeAttribute',
        attribute: 'style',
        target: '#input1'
      }
    ]
  }
};
