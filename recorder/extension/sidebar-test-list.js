/* global $, Testophobia */
Testophobia.tests = null;

Testophobia.chooseTest = () => {
  Testophobia.activeTest = null;
  Testophobia.activeTestPath = null;
  Testophobia.actions = [];
  Testophobia.actionsChanged();
  fetchTests().then(() => {
    $('#divTestList').removeAttr('hidden');
    $('#divControls').attr('hidden', '');
    $('#lnkStartOver').attr('hidden', '');
    if (Testophobia.tests && Testophobia.tests.length) {
      $('#divTestListLabel').text('Existing Tests');
      testsChanged();
    } else {
      $('#divTestListLabel').text('No Tests Found!');
    }
  });
};

Testophobia.loadTest = testPath => {
  hideTestList();
  setTestName(testPath);
  fetch(`${Testophobia.serverUrl}/test/${encodeURIComponent(testPath)}`)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      Testophobia.activeTest = data;
      Testophobia.activeTestPath = testPath;
      setTestophobiaActions(data.actions);
      localStorage.setItem('testophobia-test-loading', true);
      fetch(`${Testophobia.serverUrl}/navigate/${encodeURIComponent(data.path)}`, {method:'post'});
    });
};

function fetchTests() {
  return new Promise((resolve, reject) => {
    fetch(`${Testophobia.serverUrl}/tests`)
      .then(function(response) {
        return response.json();
      })
      .then(function(testResults) {
        Testophobia.tests = testResults;
        resolve();
      })
      .catch(reject);
    });
}

function hideTestList() {
  $('#divTestList').attr('hidden', '');
  $('#divControls').removeAttr('hidden');
  $('#lnkStartOver').removeAttr('hidden');
}

function testsChanged() {
  let rendered = '';
  Testophobia.tests.forEach((t, idx) => {
    rendered += `<li data-index="${idx}">${t}</li>`;
  });
  $('#divTestList ul').html(rendered);
  $('#divTestList ul li').click(e => Testophobia.loadTest($(e.target).text()));
}

function setTestName(name) {
  $('#divCurrentTest').text(name);
}

function setTestophobiaActions(actions) {
  Testophobia.actions = actions;
  Testophobia.actionsChanged();
}

$('#btnNewTest').click(() => {
  hideTestList();
  setTestName('(new test)');
  Testophobia.showSaveDialog();
});

$('#lnkStartOver').click(() => {
  if (confirm('Are you sure you want to start over?')) Testophobia.chooseTest();
});