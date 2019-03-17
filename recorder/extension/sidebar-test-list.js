/* global $, Testophobia */
(() => {
Testophobia.tests = null;

Testophobia.chooseTest = () => {
  Testophobia.activeTest = null;
  Testophobia.activeTestPath = null;
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
    .then(response => response.json())
    .then(data => {
      Testophobia.activeTest = data;
      Testophobia.activeTestPath = testPath;
      Testophobia.actionsChanged();
      localStorage.setItem('testophobia-test-loading', true);
      fetch(`${Testophobia.serverUrl}/navigate/${encodeURIComponent(data.path)}`, {method:'post'});
    });
};

Testophobia.editTest = testPath => {
  fetch(`${Testophobia.serverUrl}/test/${encodeURIComponent(testPath)}`)
    .then(response => response.json())
    .then(data => {
      Testophobia.editingTest = data;
      Testophobia.editingTestPath = testPath;
      Testophobia.showTestDialog();
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
    rendered += `<li data-index="${idx}"><span>${t}</span><span data-test="${t}"><svg data-row="${idx}" data-type="edit" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></g></svg></span></li>`;
  });
  $('#divTestList ul').html(rendered);
  $('#divTestList ul li span:first-child').click(e => Testophobia.loadTest($(e.target).text()));
  $('#divTestList ul li span:last-child').click(e => {
    Testophobia.editTest($(e.currentTarget).attr('data-test'));
  });
}

function setTestName(name) {
  $('#divCurrentTest').text(name);
}

$('#btnNewTest').click(() => {
  hideTestList();
  setTestName('(new test)');
  Testophobia.showTestDialog();
});

$('#lnkStartOver').click(() => {
  if (confirm('Are you sure you want to start over?')) Testophobia.chooseTest();
});
})();