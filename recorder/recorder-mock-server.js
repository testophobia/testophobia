/* global require, __dirname */
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'extension')));

app.get('/config', (req, res) => {
  res.header('Content-Type', 'application/json');
  res.send(JSON.stringify({
    bail: true,
    delay: 400,
    threshold: 0.2,
    diffDirectory: './testophobia/diffs',
    goldenDirectory: './testophobia/golden-screens',
    testDirectory: './testophobia/test-screens',
    baseUrl: 'http://localhost:6789',
    fileType: 'png',
    defaultTime: 2068786800000,
    quality: 80,
    dimensions: [
      {type: 'desktop', width: 1024, height: 768},
      {type: 'mobile', width: 375, height: 812}
    ],
    clipRegions: [
      {
        type: 'desktop',
        left: 0,
        top: 8
      },{
        type: 'tablet',
        left: 0,
        top: 16
      }
    ],
    tests: 'tests/**/*-test.js',
    projectDir: '/Users/somedude/somedir/someproject',
    delayModifier: 0.9,
    pageLoadMax: 1200
  }));
});

app.get('/tests', (req, res) => {
  res.header('Content-Type', 'application/json');
  res.send(JSON.stringify([
    'tests/page1/page1-test.js',
    'tests/page2/page2-test.js',
    'tests/page3/page3-test.js'
  ]));
});

app.get('/test/:testPath', (req, res) => {
  res.header('Content-Type', 'application/json');
  res.send(JSON.stringify({
    name: 'page1',
    threshold: 0.4,
    path: '/page1',
    delay: 300,
    skipScreen: true,
    dimensions: [
      {type: 'desktop', width: 800, height: 600}
    ],
    clipRegions: [
      {
        type: 'desktop',
        left: 0,
        top: 32
      },{
        type: 'tablet',
        left: 0,
        top: 48
      }
    ],
    actionsClipRegions: [
      {
        type: 'desktop',
        left: 0,
        top: 64
      },{
        type: 'tablet',
        left: 0,
        top: 128
      }
    ],
    actions:[
      {
        description: 'This is action #1',
        type: 'click',
        target: '#btnSave',
        delay: 300,
        threshold: 0.2,
        clipRegions: [
          {
            type: 'desktop',
            left: 0,
            top: 24
          },{
            type: 'tablet',
            left: 0,
            top: 36
          }
        ],
        excludeDimensions: ['desktop','tablet'],
        skipScreen: true
      },{
        description: 'This is action #2',
        type: 'setProperty',
        target: '#my-input1',
        property: 'value',
        value: 'Testy Phobia',
        delay: 300
      },{
        description: 'This is action #3',
        type: 'keypress',
        target: '#my-timepicker',
        key: 'Enter',
        delay: 400
      },{
        description: 'This is action #4',
        type: 'setProperty',
        target: '#my-timepicker',
        property: 'value',
        value: '1:00 AM',
        delay: 300
      }
    ]
  }));
});

app.listen(9080);