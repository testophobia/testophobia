/* global $, Testophobia */

Testophobia.showDimensionsDialog = (idx) => {
  clearValidation();
  Testophobia.editingDimensionIndex = idx;
  const test = Testophobia.getEditingTest();
  if (idx) {
    $('#divDimDialog #divDimProps #txtType').val(test.config.dimensions[idx].type || '');
    $('#divDimDialog #divDimProps #txtWidth').val(test.config.dimensions[idx].width || '');
    $('#divDimDialog #divDimProps #txtHeight').val(test.config.dimensions[idx].height || '');
    $('#divDimDialog #divDimProps #txtScale').val(test.config.dimensions[idx].scale || '');
  } else {
    $('#divDimDialog #divDimProps #txtType').val('');
    $('#divDimDialog #divDimProps #txtWidth').val('');
    $('#divDimDialog #divDimProps #txtHeight').val('');
    $('#divDimDialog #divDimProps #txtScale').val('');
  }
  $('#divBackdrop').removeAttr('hidden');
  $('#divDimDialog').removeAttr('hidden');
  $('#divDimDialog #divDimProps input').get(0).focus();
};

$('#divDimDialog #btnSaveDimension').click(updateDimension);
$('#divDimDialog .dailogClose').click(hideDimensionsDialog);

function hideDimensionsDialog() {
  $('#divBackdrop').attr('hidden', '');
  $('#divDimDialog').attr('hidden', '');
  Testophobia.showTestDialog();
}

function updateDimension() {
  clearValidation();
  const test = Testophobia.getEditingTest();
  const idx = Testophobia.editingDimensionIndex;
  const dim = {};
  if (/(.|\s)*\S(.|\s)*/.test($('#divDimDialog #divDimProps #txtType').val())) {
    dim.type = $('#divDimDialog #divDimProps #txtType').val();
  } else {
    $('#divDimDialog #divDimProps #txtType').attr('invalid', '');
    return;
  }
  if (/^[1-9]\d*$/.test($('#divDimDialog #divDimProps #txtWidth').val())) {
    dim.width = Number($('#divDimDialog #divDimProps #txtWidth').val());
  } else {
    $('#divDimDialog #divDimProps #txtWidth').attr('invalid', '');
    return;
  }
  if (/^[1-9]\d*$/.test($('#divDimDialog #divDimProps #txtHeight').val())) {
    dim.height = Number($('#divDimDialog #divDimProps #txtHeight').val());
  } else {
    $('#divDimDialog #divDimProps #txtHeight').attr('invalid', '');
    return;
  }
  if (/^(0(\.\d+)?|1(\.0+)?)$/.test($('#divDimDialog #divDimProps #txtScale').val()))
    dim.scale = Number($('#divDimDialog #divDimProps #txtScale').val());
  else
    delete dim.scale;
  if (idx == null)
    test.config.dimensions.push(dim);
  else
    test.config.dimensions[idx] = dim;
  Testophobia.editingDimensionIndex = null;
  hideDimensionsDialog();
}

function clearValidation() {
  $('#divDimDialog #divDimProps #txtType').removeAttr('invalid');
  $('#divDimDialog #divDimProps #txtWidth').removeAttr('invalid');
  $('#divDimDialog #divDimProps #txtHeight').removeAttr('invalid');
}
