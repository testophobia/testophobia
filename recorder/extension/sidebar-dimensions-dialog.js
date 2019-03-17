/* global Testophobia */

Testophobia.showDimensionsDialog = () => {
  const test = Testophobia.getEditingTest();
  Testophobia.showListDialog('editingDimensionIndex',
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