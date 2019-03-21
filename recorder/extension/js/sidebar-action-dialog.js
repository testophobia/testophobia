/* global $, Testophobia */
(() => {
Testophobia.dialogActionIndex = -1;
Testophobia.dialogActionType;

Testophobia.showActionDialog = (actionIdx) => {
  Testophobia.dialogActionIndex = actionIdx;
  Testophobia.dialogActionType = Testophobia.activeTest.actions[Testophobia.dialogActionIndex].type;
  $('#dlgAction').on('change', dropdownChanged);
  layoutDialog();
};

Testophobia.hideActionsDialog = () => {
  $('#divBackdrop').attr('hidden', '');
  $('#divActionDialog').attr('hidden', '');
  $('#dlgAction').off('change');
  Testophobia.actionsChanged();
};

function dropdownChanged() {
  Testophobia.dialogActionType = $('#dlgAction').val();
  layoutDialog();
}

function layoutDialog() {
  let action = Testophobia.activeTest.actions[Testophobia.dialogActionIndex];
  $('#dlgAction').val(Testophobia.dialogActionType);
  $('#txtTarget').val(action.target);
  let fieldsHtml = '';
  const addField = (label, prop) => `\n      <label>${label}</label>\n      <input id="txt${prop}" value="${action[prop] || ''}"/>`;
  switch (Testophobia.dialogActionType) {
    case 'setProperty':
      fieldsHtml = `${addField('Property Name', 'property')}${addField('Property Value', 'value')}`;
      break;
    case 'setAttribute':
      fieldsHtml = `${addField('Attribute Name', 'attribute')}${addField('Attribute Value', 'value')}`;
      break;
    case 'removeAttribute':
      fieldsHtml = `${addField('Attribute Name', 'attribute')}`;
      break;
    case 'scroll':
      fieldsHtml = `${addField('Scroll Top', 'scrollTop')}${addField('Scroll Left', 'scrollLeft')}`;
      break;
    case 'keypress':
      fieldsHtml = `${addField('Key', 'key')}`;
      break;
    case 'input':
      fieldsHtml = `${addField('Value', 'value')}`;
      break;
  }
  $('#divAddlFields').html(fieldsHtml + '\n    ');
  $('#divActionProps #txtDelay').val(action.delay || '');
  $('#divActionProps #txtThreshold').val(action.threshold || '');
  loadClipRegions(action);
  loadExcludedDimensions(action);
  $('#divActionProps #chkSkipScreen').prop('checked', action.skipScreen || false);
  $('#divBackdrop').removeAttr('hidden');
  $('#divActionDialog').removeAttr('hidden');
  $('#divActionProps input').get(0).focus();
}

function loadClipRegions(action) {
  Testophobia.buildListControl(
    '#lstClipRegionsPerAction',
    action.clipRegions,
    f => `${f.type} - ${f.left || 0}:${f.top || 0}:${f.width || f.right || '100%'}:${f.height || f.bottom || '100%'}`,
    e => {
      Testophobia.editingClipRegionForActionIndex = $(e.currentTarget).attr('data-row');
      Testophobia.hideActionsDialog();
      Testophobia.showClipRegionsDialog(action,
                                        'clipRegions',
                                        'editingClipRegionForActionIndex' ,
                                        '#divClipRegionsForActionDialog',
                                        '#divClipRegionsForActionProps',
                                        Testophobia.showActionDialog(Testophobia.dialogActionIndex));
    },
    e => {
      action.clipRegions.splice($(e.currentTarget).attr('data-row'), 1);
      loadClipRegions(action);
    });
}

function loadExcludedDimensions(action) {
  Testophobia.buildListControl(
    '#lstExcludedDimensions',
    action.excludeDimensions,
    f => f,
    null,
    e => {
      action.excludeDimensions.splice($(e.currentTarget).attr('data-row'), 1);
      loadExcludedDimensions(action);
    });
}

function saveEdits() {
  if (/^[1-9]\d*$/.test($('#divActionProps #txtDelay').val()))
    Testophobia.activeTest.actions[Testophobia.dialogActionIndex].delay = Number($('#divActionProps #txtDelay').val());
  else
    delete Testophobia.activeTest.actions[Testophobia.dialogActionIndex].delay;
  if (/^0\.[1-9]$/.test($('#divActionProps #txtThreshold').val()))
    Testophobia.activeTest.actions[Testophobia.dialogActionIndex].threshold = Number($('#divActionProps #txtThreshold').val());
  else
    delete Testophobia.activeTest.actions[Testophobia.dialogActionIndex].threshold;
  if ($('#divActionProps #chkSkipScreen').prop('checked'))
    Testophobia.activeTest.actions[Testophobia.dialogActionIndex].skipScreen = true;
  else
    delete Testophobia.activeTest.actions[Testophobia.dialogActionIndex].skipScreen;
  Testophobia.activeTest.actions[Testophobia.dialogActionIndex].type = Testophobia.dialogActionType;
  Testophobia.activeTest.actions[Testophobia.dialogActionIndex].target = $('#txtTarget').val();
  $('#divAddlFields input').each(function () {
    Testophobia.activeTest.actions[Testophobia.dialogActionIndex][this.id.substr(3)] = $(this).val();
  });
  Testophobia.hideActionsDialog();
}

function setSelectedElement() {
  Testophobia.chrome.devtools.inspectedWindow.eval(`(function(){return getUniqueSelector($0);}())`,
    {useContentScriptContext: true},
    result => {
      $('#txtTarget').val(result);
    }
  );
}

function addClipRegion() {
  Testophobia.hideActionsDialog();
  const action = Testophobia.activeTest.actions[Testophobia.dialogActionIndex];
  Testophobia.showClipRegionsDialog(action, 'clipRegions', 'editingClipRegionForActionIndex' , '#divClipRegionsForActionDialog' , '#divClipRegionsForActionProps', () => Testophobia.showActionDialog(Testophobia.dialogActionIndex));
}

function addDimensionExclude() {
  Testophobia.hideActionsDialog();
  const action = Testophobia.activeTest.actions[Testophobia.dialogActionIndex];
  if (!action.excludeDimensions) action.excludeDimensions = [];
  let rendered = '';
  rendered += '<h3>Add Dimension Exclude</h3>';
  rendered += '<div class="dialogClose">&times;</div>';
  rendered += '<div id="divValueEditProps" class="dialogForm">';
  rendered += '<label>Dimension Name</label>';
  rendered += '<input id="txtValue"/>';
  rendered += '</div>';
  rendered += '<button id="btnApplyValueEdit" class="dialogBtn green button">Apply</button>';
  $('#divValueEditDialog').html(rendered);
  Testophobia.showValueDialog(
      '#divValueEditDialog',
      '#divValueEditProps',
      action.excludeDimensions,
      {name:'excludeDimensions', selector:'#divValueEditDialog #divValueEditProps #txtValue', type: 'string', required: true},
      () => Testophobia.showActionDialog(Testophobia.dialogActionIndex)
    );
}

function buildList() {
  let rendered = '';
  rendered += '<h3>Action Details</h3>';
  rendered += '<div class="dialogClose">&times;</div>';
  rendered += '<div id="divActionProps" class="dialogForm">';
  rendered += '<div class="dropdown button blue" title="Select an Action Type">';
  rendered += '<select id="dlgAction" required>';
  rendered += '<option value="click">Click</option>';
  rendered += '<option value="hover">Hover</option>';
  rendered += '<option value="scroll">Scroll</option>';
  rendered += '<option value="clearInput">Clear Input</option>';
  rendered += '<option value="input">Input Text</option>';
  rendered += '<option value="keypress">Key Press</option>';
  rendered += '<option value="setProperty">Set Property</option>';
  rendered += '<option value="setAttribute">Set Attribute</option>';
  rendered += '<option value="removeAttribute">Remove Attribute</option>';
  rendered += '</select>';
  rendered += '</div>';
  rendered += '<br><br>';
  rendered += '<label>Target</label>';
  rendered += '<input id="txtTarget"/>';
  rendered += '<div id="divAddlFields"></div>';
  rendered += '<label>Delay before snapshot</label>';
  rendered += '<input id="txtDelay"/>';
  rendered += '<label>Threshold</label>';
  rendered += '<input id="txtThreshold"/>';
  rendered += '<div class="listHeader"><label>Exclude Dimensions</label><button id="btnAddDimensionExclude" class="link-button">Add</button></div>';
  rendered += '<ul id="lstExcludedDimensions" class="dialogList"></ul>';
  rendered += '<div class="listHeader"><label>Clip Regions (this action)</label><button id="btnAddClipRegionPerAction" class="link-button">Add</button></div>';
  rendered += '<ul id="lstClipRegionsPerAction" class="dialogList"></ul>';
  rendered += '<input id="chkSkipScreen" type="checkbox"/>';
  rendered += '<label for="chkSkipScreen">Skip snapshot for this action</label>';
  rendered += '</div>';
  rendered += '<button id="btnSaveEdits" class="dialogBtn green button">Apply</button>';
  $('#divActionDialog').html(rendered);
}

buildList();

$('#btnAddClipRegionPerAction').click(() => addClipRegion());
$('#btnAddDimensionExclude').click(() => addDimensionExclude());
$('#divActionDialog .dialogClose').click(Testophobia.hideActionsDialog);
$('#btnSaveEdits').click(saveEdits);
Testophobia.chrome.devtools.panels.elements.onSelectionChanged.addListener(setSelectedElement);
})();