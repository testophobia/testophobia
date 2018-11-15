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
  clearValidation();
  if (Testophobia.activeTest) {
    $('#divSaveDialogTitle').removeAttr('hidden');
    $('#divTestProps label:nth-child(1)').attr('hidden', '');
    $('#divTestProps #txtFile').attr('hidden', '');
    $('#divSaveDialogTitle').text(`${Testophobia.activeTestPath}`);
    $('#divTestProps #txtName').val(Testophobia.activeTest.name || '');
    $('#divTestProps #txtPath').val(Testophobia.activeTest.path || '');
    $('#divTestProps #txtDelay').val(Testophobia.activeTest.delay || '');
    $('#divTestProps #txtThreshold').val(Testophobia.activeTest.threshold || '');
  } else {
    $('#divSaveDialogTitle').text('');
    $('#divSaveDialogTitle').attr('hidden', '');
    $('#divTestProps input').val('');
    $('#divTestProps label:nth-child(1)').removeAttr('hidden');
    $('#divTestProps #txtFile').removeAttr('hidden');
  }
  $('#divBackdrop').removeAttr('hidden');
  $('#divSaveDialog').removeAttr('hidden');
  $('#divTestProps input').get(0).focus();
}

function hideSaveDialog() {
  $('#divBackdrop').attr('hidden', '');
  $('#divSaveDialog').attr('hidden', '');
}

function saveTest() {
  clearValidation();
  if (!Testophobia.activeTest) {
    if (/(.|\s)*\S(.|\s)*/.test($('#divTestProps #txtFile').val())) {
      Testophobia.activeTestPath = $('#divTestProps #txtFile').val();
      Testophobia.activeTest = {};
    } else {
      $('#divTestProps #txtFile').attr('invalid', '');
      return;
    }
  }
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
      setTimeout(() => alert('Test saved.'), 100);
    });
}

function clearValidation() {
  $('#divTestProps #txtName').removeAttr('invalid');
  $('#divTestProps #txtFile').removeAttr('invalid');
}
