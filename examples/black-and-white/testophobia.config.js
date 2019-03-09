export default {
  "threshold": 0.2,
  "diffDirectory": "./testophobia/diffs",
  "goldenDirectory": "./testophobia/golden-screens",
  "testDirectory": "./testophobia/test-screens",
  "baseUrl": "https://testophobia.github.io",
  "fileType": "jpeg",
  "dimensions": [
    {
      "type": "desktop",
      "width": 1024,
      "height": 768
    }
  ],
  "tests": "tests/**/*-test.js"
};
