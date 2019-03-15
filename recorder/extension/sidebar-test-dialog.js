/* global $, Testophobia */

Testophobia.showTestDialog = () => {
  clearValidation();
  if (Testophobia.editingTest) {
    loadDialogValues(Testophobia.editingTest, Testophobia.editingTestPath);
  } else if (Testophobia.activeTest) {
    loadDialogValues(Testophobia.activeTest, Testophobia.activeTestPath);
  } else {
    $('#divTestDialog #divTestDialogTitle').text('');
    $('#divTestDialog #divTestDialogTitle').attr('hidden', '');
    $('#divTestDialog #divTestProps input').val('');
    $('#divTestDialog #divTestProps label:nth-child(1)').removeAttr('hidden');
    $('#divTestDialog #divTestProps #txtFile').removeAttr('hidden');
  }
  $('#divBackdrop').removeAttr('hidden');
  $('#divTestDialog').removeAttr('hidden');
  $('#divTestDialog #divTestProps input').get(0).focus();
};


$('#divTestDialog #btnPostTest').click(saveTest);
$('#divTestDialog #divTestDialogClose').click(hideSaveDialog);

function hideSaveDialog() {
  $('#divBackdrop').attr('hidden', '');
  $('#divTestDialog').attr('hidden', '');
}

function loadDialogValues(test, testPath) {
  $('#divTestDialog #divTestDialogTitle').removeAttr('hidden');
  $('#divTestDialog #divTestProps label:nth-child(1)').attr('hidden', '');
  $('#divTestDialog #divTestProps #txtFile').attr('hidden', '');
  $('#divTestDialog #divTestDialogTitle').text(`${testPath}`);
  $('#divTestDialog #divTestProps #txtName').val(test.name || '');
  $('#divTestDialog #divTestProps #txtPath').val(test.path || '');
  $('#divTestDialog #divTestProps #txtDelay').val(test.delay || '');
  $('#divTestDialog #divTestProps #txtThreshold').val(test.threshold || '');
}

function saveTest() {
  clearValidation();
  const isEdit = Boolean(Testophobia.editingTest);
  const test = (isEdit) ? {config:Testophobia.editingTest,path:Testophobia.editingTestPath} : {config:Testophobia.activeTest,path:Testophobia.activeTestPath};
  if (test.path && test.path.indexOf('inline-test-') === 0) { //until we can support saving these tests
    setTimeout(() => Testophobia.showAlert('Error', 'Inline tests cannot be modified with the Testophobia recorder at this time.'), 100);
    return;
  }
  if (!isEdit && !test.config) {
    if (/(.|\s)*\S(.|\s)*/.test($('#divTestDialog #divTestProps #txtFile').val())) {
      test.configPath = $('#divTestDialog #divTestProps #txtFile').val();
      test.config = {};
    } else {
      $('#divTestDialog #divTestProps #txtFile').attr('invalid', '');
      return;
    }
  }
  if (/(.|\s)*\S(.|\s)*/.test($('#divTestDialog #divTestProps #txtName').val())) {
    test.config.name = $('#divTestDialog #divTestProps #txtName').val();
  } else {
    $('#divTestDialog #divTestProps #txtName').attr('invalid', '');
    return;
  }
  if (/(.|\s)*\S(.|\s)*/.test($('#divTestDialog #divTestProps #txtPath').val()))
    test.config.path = $('#divTestDialog #divTestProps #txtPath').val();
  else
    delete test.config.path;
  if (/^[1-9]\d*$/.test($('#divTestDialog #divTestProps #txtDelay').val()))
    test.config.delay = Number($('#divTestDialog #divTestProps #txtDelay').val());
  else
    delete test.config.delay;
  if (/^0\.[1-9]$/.test($('#divTestDialog #divTestProps #txtThreshold').val()))
    test.config.threshold = Number($('#divTestDialog #divTestProps #txtThreshold').val());
  else
    delete test.config.threshold;
  if ($('#divTestDialog #divTestProps #chkSkipScreen').prop('checked'))
    test.config.skipScreen = true;
  else
    delete test.config.skipScreen;
  if (!isEdit) test.config.actions = Testophobia.actions;
  fetch(`${Testophobia.serverUrl}/test/${encodeURIComponent(test.path)}`,
    {
      method: 'post',
      body: JSON.stringify(test.config)
    }).then(() => {
      hideSaveDialog();
      setTimeout(() => Testophobia.showAlert('Success', 'Test saved.', () => {
        if (isEdit) {
          Testophobia.editingTest = null;
          Testophobia.editingTestPath = null;
        } else {
          Testophobia.loadTest(Testophobia.activeTestPath);
        }
      }), 100);
    });
}

function clearValidation() {
  $('#divTestDialog #divTestProps #txtName').removeAttr('invalid');
  $('#divTestDialog #divTestProps #txtFile').removeAttr('invalid');
}
