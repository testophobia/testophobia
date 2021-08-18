export default {
  "bail": false,
  "verbose": false,
  "threshold": 0.2,
  "diffDirectory": "./testophobia/diffs",
  "goldenDirectory": "./testophobia/golden-screens",
  "testDirectory": "./testophobia/test-screens",
  "baseUrl": "http://localhost:8090",
  "fileType": "jpeg",
  "defaultTime": 2068786800000,
  "quality": 80,
  "delay": 500,
  "dimensions": [
    {
      "type": "desktop",
      "width": 1560,
      "height": 1300
    }
  ],
  "tests": "testophobia/tests/**/*-test.js"
};
