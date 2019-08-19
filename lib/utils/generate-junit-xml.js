/* global exports, require */
const fs = require('fs');

exports.generateJUnitXML = (tests, failures) => {
  // console.log(JSON.stringify(tests, null, 2));
  // console.log('------');
  // console.log(JSON.stringify(failures, null, 2));
  const createTestCase = (suite, test, dim, description, index) => {
    const testcase = {
      className: `${test.name}-${dim.type}-${index}`,
      name: description,
      time: 0
    };
    const failure = failures.find(f => f.test === test.name && f.screenType === dim.type && f.action === description);
    if (failure) {
      testcase.failure = {message: 'Not a match!', value: 'Screenshot Failure'};
      suite.failures++;
    }
    suite.tests++;
    suite.testcases.push(testcase);
  };
  const output = [];
  tests.forEach((test, idx) => {
    test.dimensions.forEach(dim => {
      const testsuite = {
        name: test.name + '-' + dim.type,
        testcases: [],
        time: 0,
        tests: 0,
        skipped: 0,
        failures: 0
      };
      createTestCase(testsuite, test, dim, 'none', 0);
      test.actions.forEach((action, i) => {
        createTestCase(testsuite, test, dim, action.description, i + 1);
      });
      output.push(testsuite);
    });
  });
  console.log(JSON.stringify(output, null, 2));
  // if (!config) return 0;
  // let resultFile = (config.diffDirectory) + '/results.json';
  // let results = {
  //   tests: tests,
  //   date: Date.now(),
  //   fileType: config.fileType,
  //   quality: (config.fileType === 'png') ? 'n/a' : config.quality,
  //   threshold: config.threshold,
  //   baseUrl: config.baseUrl,
  //   screenTypes: config.dimensions,
  //   failures: failures
  // };
  // fs.writeFileSync(resultFile, JSON.stringify(results));
};
