/* global $, Testophobia */
(() => {
$('#btnClearAll').click(() => {
  Testophobia.showAlert('Confirm', 'Are you sure you want to clear all actions?', null, () => {
    Testophobia.activeTest.actions = [];
    Testophobia.actionsChanged();
  });
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