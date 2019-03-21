/* global $, Testophobia */
(() => {
Testophobia.getEditingTest = () => {
  return (Testophobia.editingTest) ?
                {config:Testophobia.editingTest,path:Testophobia.editingTestPath} :
                {config:Testophobia.activeTest,path:Testophobia.activeTestPath};
};

Testophobia.showTestDialog = () => {
  Testophobia.validation.clear('#divTestDialog #divTestProps');
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
  loadClipRegions(test, false);
  loadClipRegions(test, true);
}

function loadTestDimensions(test) {
  Testophobia.buildListControl(
    '#divTestProps #lstDimensions',
    test.dimensions,
    f => `${f.type} - ${f.width}:${f.height} ${(f.scale) ? f.scale : ''}`,
    e => {
      const test = Testophobia.getEditingTest();
      Testophobia.editingDimensionIndex = $(e.currentTarget).attr('data-row');
      hideSaveDialog();
      Testophobia.showDimensionsDialog(test.config, Testophobia.showTestDialog);
    },
    e => {
      const test = Testophobia.getEditingTest();
      test.config.dimensions.splice($(e.currentTarget).attr('data-row'), 1);
      loadTestDimensions(test.config);
    });
}

function loadClipRegions(test, isAction) {
  const modelProp = (isAction) ? 'actionsClipRegions' : 'clipRegions';
  const idxField = (isAction) ? 'editingActionRegionsIndex' : 'editingClipRegionsIndex';
  Testophobia.buildListControl(
    (isAction) ? '#lstActionClipRegions' : '#lstClipRegions',
    test[modelProp],
    f => `${f.type} - ${f.left || 0}:${f.top || 0}:${f.width || f.right || '100%'}:${f.height || f.bottom || '100%'}`,
    e => {
      Testophobia[idxField] = $(e.currentTarget).attr('data-row');
      hideSaveDialog();
      const test = Testophobia.getEditingTest();
      Testophobia.showClipRegionsDialog(test.config,
                                        modelProp,
                                        idxField ,
                                        (isAction) ? '#divActionRegionsDialog' : '#divRegionsDialog',
                                        (isAction) ? '#divActionRegionsProps' : '#divRegionsProps',
                                        Testophobia.showTestDialog);
    },
    e => {
      const test = Testophobia.getEditingTest();
      test.config[modelProp].splice($(e.currentTarget).attr('data-row'), 1);
      loadClipRegions(test.config, isAction);
    });
}

function addDimension() {
  hideSaveDialog();
  const test = Testophobia.getEditingTest();
  Testophobia.showDimensionsDialog(test.config, Testophobia.showTestDialog);
}

function addClipRegion(action) {
  hideSaveDialog();
  const test = Testophobia.getEditingTest();
  if (action)
    Testophobia.showClipRegionsDialog(test.config, 'clipRegions', 'editingClipRegionsIndex' , '#divRegionsDialog' , '#divRegionsProps', Testophobia.showTestDialog);
  else
    Testophobia.showClipRegionsDialog(test.config, 'actionsClipRegions', 'editingActionRegionsIndex' , '#divActionRegionsDialog' , '#divActionRegionsProps', Testophobia.showTestDialog);
}

function saveTest() {
  Testophobia.validation.clear('#divTestDialog #divTestProps');
  const isEdit = Boolean(Testophobia.editingTest);
  const test = Testophobia.getEditingTest();
  if (test.path && test.path.indexOf('inline-test-') === 0) { //until we can support saving these tests
    setTimeout(() => Testophobia.showAlert('Error', 'Inline tests cannot be modified with the Testophobia recorder at this time.'), 100);
    return;
  }
  if (!isEdit && !test.config) {
    const fileField = {name:'path',type:'string',selector:'#txtFile',required:true};
    if (Testophobia.validation.isFieldValid(fileField, '#divTestDialog', '#divTestProps')) {
      test.path = $('#divTestDialog #divTestProps #txtFile').val();
      Testophobia.activeTestPath = test.path;
      test.config = {};
    } else {
      Testophobia.validation.handleInvalidField(fileField, null, '#divTestDialog', '#divTestProps');
      return;
    }
  }
  if (!Testophobia.validation.validate({name:'name',type:'string',selector:'#divTestDialog #divTestProps #txtName',required:true}, test.config)) return;
  Testophobia.validation.validate({name:'path',type:'string',selector:'#divTestDialog #divTestProps #txtPath',required:false}, test.config);
  Testophobia.validation.validate({name:'delay',type:'number',selector:'#divTestDialog #divTestProps #txtDelay',required:false}, test.config);
  Testophobia.validation.validate({name:'threshold',type:'decimal',selector:'#divTestDialog #divTestProps #txtThreshold',required:false}, test.config);
  Testophobia.validation.validate({name:'skipScreen',type:'boolean',selector:'#divTestDialog #divTestProps #chkSkipScreen',required:false}, test.config);

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

function buildList() {
  let rendered = '';
  rendered += '<h3>Save Test</h3>';
  rendered += '<div class="dialogClose">&times;</div>';
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
  rendered += '<div class="listHeader"><label>Dimensions</label><button id="btnAddTestDimension" class="link-button">Add</button></div>';
  rendered += '<ul id="lstDimensions" class="dialogList"></ul>';
  rendered += '<div class="listHeader"><label>Clip Regions</label><button id="btnAddTestClipRegion" class="link-button">Add</button></div>';
  rendered += '<ul id="lstClipRegions" class="dialogList"></ul>';
  rendered += '<div class="listHeader"><label>Action Clip Regions</label><button id="btnAddTestActionClipRegion" class="link-button">Add</button></div>';
  rendered += '<ul id="lstActionClipRegions" class="dialogList"></ul>';
  rendered += '<input id="chkSkipScreen" type="checkbox"/>';
  rendered += '<label for="chkSkipScreen">Skip initial snapshot</label>';
  rendered += '</div>';
  rendered += '<button id="btnPostTest" class="dialogBtn green button">Save</button>';
  $('#divTestDialog').html(rendered);
}

buildList();
$('#btnAddTestDimension').click(addDimension);
$('#btnAddTestClipRegion').click(() => addClipRegion(true));
$('#btnAddTestActionClipRegion').click(() => addClipRegion(false));
$('#divTestDialog #btnPostTest').click(saveTest);
$('#divTestDialog .dialogClose').click(hideSaveDialog);
})();