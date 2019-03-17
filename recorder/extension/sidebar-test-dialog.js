/* global $, Testophobia */

Testophobia.getEditingTest = () => {
  return (Testophobia.editingTest) ?
                {config:Testophobia.editingTest,path:Testophobia.editingTestPath} :
                {config:Testophobia.activeTest,path:Testophobia.activeTestPath};
};

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

$('#btnAddTestDimension').click(addDimension);
$('#divTestDialog #btnPostTest').click(saveTest);
$('#divTestDialog .dailogClose').click(hideSaveDialog);

function hideSaveDialog() {
  $('#divBackdrop').attr('hidden', '');
  $('#divTestDialog').attr('hidden', '');
}

function loadDialogValues(test, testPath) {
  $('#divTestDialog #divTestDialogTitle').removeAttr('hidden');
  $('#divTestDialog #divTestProps > label:nth-child(1)').attr('hidden', '');
  $('#divTestDialog #divTestProps #txtFile').attr('hidden', '');
  $('#divTestDialog #divTestDialogTitle').text(`${testPath}`);
  $('#divTestDialog #divTestProps #txtName').val(test.name || '');
  $('#divTestDialog #divTestProps #txtPath').val(test.path || '');
  $('#divTestDialog #divTestProps #txtDelay').val(test.delay || '');
  $('#divTestDialog #divTestProps #txtThreshold').val(test.threshold || '');
  loadTestDimensions(test);
}

function loadTestDimensions(test) {
  if (test.dimensions) {
    let rendered = '';
    test.dimensions.forEach((f, idx) => {
      const displayString = `${f.type} - ${f.width}:${f.height} ${(f.scale) ? f.scale : ''}`;
      rendered += `<li data-index="${idx}">`;
      rendered += `<span>${displayString}</span>`;
      rendered += `<svg data-row="${idx}" data-type="edit" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></g></svg>`;
      rendered += `<svg data-row="${idx}" data-type="del" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g></svg>`;
      rendered += '</li>';
    });
    $('#lstDimensions').html(rendered);
    $('#lstDimensions li svg[data-type="edit"]').click(e => {
      Testophobia.editingDimensionIndex = $(e.currentTarget).attr('data-row');
      hideSaveDialog();
      Testophobia.showDimensionsDialog();
    });
    $('#lstDimensions li svg[data-type="del"]').click(e => {
      deleteTestDimension($(e.currentTarget).attr('data-row'));
    });
  } else {
    $('#lstDimensions').html('');
  }
}

function deleteTestDimension(idx) {
  const test = Testophobia.getEditingTest();
  test.config.dimensions.splice(idx, 1);
  loadTestDimensions(test.config);
}

function addDimension() {
  hideSaveDialog();
  Testophobia.showDimensionsDialog();
}

function saveTest() {
  clearValidation();
  const isEdit = Boolean(Testophobia.editingTest);
  const test = Testophobia.getEditingTest();
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
