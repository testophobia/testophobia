export default {
    bail: false,
    verbose: false,
    threshold: 0.2,
    diffDirectory: './sandbox/diffs',
    goldenDirectory: './sandbox/golden-screens',
    testDirectory: './sandbox/test-screens',
    baseUrl: 'http://localhost:8081',
    fileType: 'jpeg',
    defaultTime: 2068786800000,
    quality: 80,
    dimensions: [
      {
        type: 'desktop',
        width: 1024,
        height: 768
      },
      {
        type: 'mobile',
        width: 375,
        height: 812
      }
    ],
    tests: 'sandbox/tests/**/*-test.js'
  };
