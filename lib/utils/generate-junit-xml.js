/* global exports, require */
const fs = require('fs');
const path = require('path');

exports.generateJUnitXML = (outputDir, tests, failures) => {
  const createTestCase = (suite, test, dim, description, index) => {
    const testcase = {
      className: `${test.name}-${dim.type}-${index}`,
      name: description === 'none' ? 'Initial Snapshot' : description,
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
  const escapeForXml = str => {
    return str
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };
  let xml = '<?xml version="1.0" encoding="UTF-8"?><testsuites>';
  output.forEach(ts => {
    xml += '<testsuite';
    Object.keys(ts).forEach(k => (k !== 'testcases' ? (xml += ` ${k}="${escapeForXml(ts[k])}"`) : ''));
    xml += '>';
    ts.testcases.forEach(tc => {
      xml += '<testcase';
      Object.keys(tc).forEach(k => (k !== 'failure' ? (xml += ` ${k}="${escapeForXml(tc[k])}"`) : ''));
      xml += '>';
      if (tc.failure) {
        xml += `<failure message="${escapeForXml(tc.failure.message)}">${escapeForXml(tc.failure.value)}</failure>`;
      }
      xml += '</testcase>';
    });
    xml += '</testsuite>';
  });
  xml += '</testsuites>';
  fs.writeFileSync(path.resolve(outputDir, 'junit.xml'), xml);
};
