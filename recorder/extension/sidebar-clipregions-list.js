/* global $, Testophobia */

Testophobia.showClipRegionsDialog = (modelProp, idxField, dlgSelector, frmSelector) => {
  const test = Testophobia.getEditingTest();
  if (!test.config[modelProp]) test.config[modelProp] = [];
  Testophobia.showListDialog(
    idxField,
    dlgSelector,
    frmSelector,
    test.config[modelProp],
    [
      {name:'type', selector:'#txtType', type: 'string', required: true},
      {name:'left', selector:'#txtLeft', type: 'number', required: false},
      {name:'top', selector:'#txtTop', type: 'number', required: false},
      {name:'right', selector:'#txtRight', type: 'number', required: false},
      {name:'bottom', selector:'#txtBottom', type: 'number', required: false},
      {name:'width', selector:'#txtWidth', type: 'number', required: false},
      {name:'height', selector:'#txtHeight', type: 'number', required: false}
    ]
  );
};

function buildList(lbl, dlgSelector, formId, btnId) {
  let rendered = '';
  rendered += `<h3>${lbl}</h3>`;
  rendered += '<div class="dailogClose">&times;</div>';
  rendered += `<div id="${formId}" class="dialogForm">`;
  rendered += '<label>Type</label>';
  rendered += '<input id="txtType"/>';
  rendered += '<label>Left</label>';
  rendered += '<input id="txtLeft"/>';
  rendered += '<label>Top</label>';
  rendered += '<input id="txtTop"/>';
  rendered += '<label>Right</label>';
  rendered += '<input id="txtRight"/>';
  rendered += '<label>Bottom</label>';
  rendered += '<input id="txtBottom"/>';
  rendered += '<label>Width</label>';
  rendered += '<input id="txtWidth"/>';
  rendered += '<label>Height</label>';
  rendered += '<input id="txtHeight"/>';
  rendered += '</div>';
  rendered += `<button id="${btnId}" class="dialogBtn green button">Save</button>`;
  $(dlgSelector).html(rendered);
}

buildList('Test Clip Regions', '#divRegionsDialog', 'divRegionsProps', 'btnSaveClipRegion');
buildList('Test Action Clip Regions', '#divActionRegionsDialog', 'divActionRegionsProps', 'btnSaveActionRegion');