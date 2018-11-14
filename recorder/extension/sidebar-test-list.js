/* global $, Testophobia */
window.Testophobia = window.Testophobia || {};

Testophobia.tests = null;

Testophobia.fetchTests = () => {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:8091/tests')
      .then(function(response) {
        return response.json();
      })
      .then(function(testResults) {
        Testophobia.tests = testResults;
        if (Testophobia.tests && Testophobia.tests.length) {
          testsChanged();
        } else {
          hideTestList();
        }
        resolve();
      })
      .catch(reject);
    });
};

Testophobia.loadTest = () => {
  hideTestList();
  //TODO
};

function showTestList() {
  $('#divTestList').removeAttr('hidden');
  $('#divControls').attr('hidden', '');
}

function hideTestList() {
  $('#divTestList').attr('hidden', '');
  $('#divControls').removeAttr('hidden');
}

function testsChanged() {
  let rendered = '';
  Testophobia.tests.forEach((t, idx) => {
    rendered += `<li data-index="${idx}">${t}</li>`;
  });
  $('#divTestList ul').html(rendered);
  $('#divTestList ul li').click(Testophobia.loadTest);
}

showTestList();