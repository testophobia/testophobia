/* global $, Testophobia */

Testophobia.showDimensionsDialog = () => {
  const test = Testophobia.getEditingTest();
  if (!test.config.dimensions) test.config.dimensions = [];
  Testophobia.showListDialog(
    'editingDimensionIndex',
    '#divDimDialog',
    '#divDimProps',
    test.config.dimensions,
    [
      {name:'type', selector:'#txtType', type: 'string', required: true},
      {name:'width', selector:'#txtWidth', type: 'number', required: true},
      {name:'height', selector:'#txtHeight', type: 'number', required: true},
      {name:'scale', selector:'#txtScale', type: 'decimal', required: false}
    ]
  );
};

function buildList() {
  let rendered = '';
  rendered += '<h3>Test Dimensions</h3>';
  rendered += '<div class="dailogClose">&times;</div>';
  rendered += '<div id="divDimProps" class="dialogForm">';
  rendered += '<label>Type</label>';
  rendered += '<input id="txtType"/>';
  rendered += '<label>Width</label>';
  rendered += '<input id="txtWidth"/>';
  rendered += '<label>Height</label>';
  rendered += '<input id="txtHeight"/>';
  rendered += '<label>Scale</label>';
  rendered += '<input id="txtScale"/>';
  rendered += '</div>';
  rendered += '<button id="btnSaveDimension" class="dialogBtn green button">Save</button>';
  $('#divDimDialog').html(rendered);
}

buildList();