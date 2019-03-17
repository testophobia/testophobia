/* global $, Testophobia */

Testophobia.showClipRegionsDialog = () => {
  const test = Testophobia.getEditingTest();
  if (!test.config.clipRegions) test.config.clipRegions = [];
  Testophobia.showListDialog(
    'editingClipRegionsIndex',
    '#divRegionsDialog',
    '#divRegionsProps',
    test.config.clipRegions,
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

function buildList() {
  let rendered = '';
  rendered += '<h3>Test Clip Regions</h3>';
  rendered += '<div class="dailogClose">&times;</div>';
  rendered += '<div id="divRegionsProps" class="dialogForm">';
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
  rendered += '<button id="btnSaveClipRegion" class="dialogBtn green button">Save</button>';
  $('#divRegionsDialog').html(rendered);
}

buildList();