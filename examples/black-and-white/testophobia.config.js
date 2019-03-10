export default {
  "bail": false,
  "verbose": false,
  "threshold": 0.2,
  "diffDirectory": "./testophobia/diffs",
  "goldenDirectory": "./testophobia/golden-screens",
  "testDirectory": "./testophobia/test-screens",
  "baseUrl": "https://testophobia.github.io",
  "fileType": "jpeg",
  "defaultTime": 2068786800000,
  "quality": 80,
  "dimensions": [
    {
      "type": "desktop",
      "width": 1024,
      "height": 768
    },
    {
      "type": "mobile",
      "width": 375,
      "height": 812
    }
  ],
  "tests": "tests/**/*-test.js"
};