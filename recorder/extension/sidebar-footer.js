/* global $, Testophobia */
(() => {
$('#btnClearAll').click(() => {
  if (confirm('Are you sure you want to clear all actions?')) {
    Testophobia.activeTest.actions = [];
    Testophobia.actionsChanged();
  }
});

$('#btnSaveTest').click(() => {
  fetch(`${Testophobia.serverUrl}/test/${encodeURIComponent(Testophobia.activeTestPath)}`,
    {
      method: 'post',
      body: JSON.stringify(Testophobia.activeTest)
    }).then(() => {
      setTimeout(() => Testophobia.showAlert('Success', 'Test saved.'), 100);
    });
});
})();