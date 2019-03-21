export default {
  "threshold": 0.3,
  "diffDirectory": "./testophobia/diffs",
  "goldenDirectory": "./testophobia/golden-screens",
  "testDirectory": "./testophobia/test-screens",
  "baseUrl": "http://localhost:8080",
  "fileType": "jpeg",
  "defaultTime": 2068786800000,
  "quality": 80,
  "dimensions": [
    {
      "type": "devtools",
      "width": 800,
      "height": 500
    }
  ],
  "tests": "testophobia/tests/*-test.js"
};