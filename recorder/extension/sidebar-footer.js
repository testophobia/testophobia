/* global $, Testophobia */
$('#btnClearAll').click(() => {
  if (confirm('Are you sure you want to clear all actions?')) {
    Testophobia.actions = [];
    Testophobia.actionsChanged();
  }
});

$('#btnSaveTest').click(showSaveDialog);
$('#btnPostTest').click(saveTest);
$('#divSaveDialogClose').click(hideSaveDialog);

function showSaveDialog() {
  $('#divTestProps #txtName').removeAttr('invalid');
  $('#divSaveDialogTitle').text(`${Testophobia.activeTestPath}`);
  $('#divTestProps #txtName').val(Testophobia.activeTest.name || '');
  $('#divTestProps #txtPath').val(Testophobia.activeTest.path || '');
  $('#divTestProps #txtDelay').val(Testophobia.activeTest.delay || '');
  $('#divTestProps #txtThreshold').val(Testophobia.activeTest.threshold || '');
  $('#divBackdrop').removeAttr('hidden');
  $('#divSaveDialog').removeAttr('hidden');
  $('#divTestProps input').get(0).focus();
}

function hideSaveDialog() {
  $('#divBackdrop').attr('hidden', '');
  $('#divSaveDialog').attr('hidden', '');
}

function saveTest() {
  if (/(.|\s)*\S(.|\s)*/.test($('#divTestProps #txtName').val())) {
    Testophobia.activeTest.name = $('#divTestProps #txtName').val();
  } else {
    $('#divTestProps #txtName').attr('invalid', '');
    return;
  }
  if (/(.|\s)*\S(.|\s)*/.test($('#divTestProps #txtPath').val()))
    Testophobia.activeTest.path = $('#divTestProps #txtPath').val();
  else
    delete Testophobia.activeTest.path;
  if (/^[1-9]\d*$/.test($('#divTestProps #txtDelay').val()))
    Testophobia.activeTest.delay = Number($('#divTestProps #txtDelay').val());
  else
    delete Testophobia.activeTest.delay;
  if (/^0\.[1-9]$/.test($('#divTestProps #txtThreshold').val()))
    Testophobia.activeTest.threshold = Number($('#divTestProps #txtThreshold').val());
  else
    delete Testophobia.activeTest.threshold;
  Testophobia.activeTest.actions = Testophobia.actions;
  fetch(`${Testophobia.serverUrl}/test/${encodeURIComponent(Testophobia.activeTestPath)}`,
    {
      method: 'post',
      body: JSON.stringify(Testophobia.activeTest)
    }).then(() => {
      hideSaveDialog();
      setCopyImage(true);
      setTimeout(() => setCopyImage(), 2000);
    });
}

function setCopyImage(confirm) {
  if (confirm)
    $('#btnSaveTest').html('<svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"></path></g></svg>');
  else
    $('#btnSaveTest').text('Save');
}

setCopyImage();
