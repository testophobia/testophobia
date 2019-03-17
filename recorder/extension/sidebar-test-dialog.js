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
  loadClipRegions(test);
}

function loadTestDimensions(test) {
  Testophobia.buildListControl(
    '#lstDimensions',
    test.dimensions,
    f => `${f.type} - ${f.width}:${f.height} ${(f.scale) ? f.scale : ''}`,
    e => {
      Testophobia.editingDimensionIndex = $(e.currentTarget).attr('data-row');
      hideSaveDialog();
      Testophobia.showDimensionsDialog();
    },
    e => {
      const test = Testophobia.getEditingTest();
      test.config.dimensions.splice($(e.currentTarget).attr('data-row'), 1);
      loadTestDimensions(test.config);
    });
}

function loadClipRegions(test) {
  Testophobia.buildListControl(
    '#lstClipRegions',
    test.clipRegions,
    f => `${f.type} - ${f.left || 0}:${f.top || 0}:${f.width || f.right || '100%'}:${f.height || f.bottom || '100%'}`,
    e => {
      Testophobia.editingClipRegionsIndex = $(e.currentTarget).attr('data-row');
      hideSaveDialog();
      Testophobia.showClipRegionsDialog();
    },
    e => {
      const test = Testophobia.getEditingTest();
      test.config.clipRegions.splice($(e.currentTarget).attr('data-row'), 1);
      loadClipRegions(test.config);
    });
}

function addDimension() {
  hideSaveDialog();
  Testophobia.showDimensionsDialog();
}

function addClipRegion() {
  hideSaveDialog();
  Testophobia.showClipRegionsDialog();
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

function buildList() {
  let rendered = '';
  rendered += '<h3>Save Test</h3>';
  rendered += '<div class="dailogClose">&times;</div>';
  rendered += '<h5 id="divTestDialogTitle"></h5>';
  rendered += '<div id="divTestProps" class="dialogForm">';
  rendered += '<label>Relative File Path</label>';
  rendered += '<input id="txtFile"/>';
  rendered += '<label>Name</label>';
  rendered += '<input id="txtName"/>';
  rendered += '<label>Path (route)</label>';
  rendered += '<input id="txtPath"/>';
  rendered += '<label>Delay before snapshot</label>';
  rendered += '<input id="txtDelay"/>';
  rendered += '<label>Threshold</label>';
  rendered += '<input id="txtThreshold"/>';
  rendered += '<div class="listHeader"><label>Dimensions</label><button id="btnAddTestDimension" class="blue button">Add</button></div>';
  rendered += '<ul id="lstDimensions" class="dialogList"></ul>';
  rendered += '<div class="listHeader"><label>Clip Regions</label><button id="btnAddTestClipRegion" class="blue button">Add</button></div>';
  rendered += '<ul id="lstClipRegions" class="dialogList"></ul>';
  rendered += '<input id="chkSkipScreen" type="checkbox"/>';
  rendered += '<label for="chkSkipScreen">Skip initial snapshot</label>';
  rendered += '</div>';
  rendered += '<button id="btnPostTest" class="dialogBtn green button">Save</button>';
  $('#divTestDialog').html(rendered);
}

buildList();
$('#btnAddTestDimension').click(addDimension);
$('#btnAddTestClipRegion').click(addClipRegion);
$('#divTestDialog #btnPostTest').click(saveTest);
$('#divTestDialog .dailogClose').click(hideSaveDialog);