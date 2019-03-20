/* global $, Testophobia */

Testophobia.showConfigDialog = () => {
  clearValidation();
  $('#divConfigDialog #divConfigProps input').val('');
  $('#divConfigDialog #divConfigProps label:nth-child(1)').removeAttr('hidden');
  $('#divConfigDialog #divConfigProps #txtThreshold').removeAttr('hidden');
  $('#divBackdrop').removeAttr('hidden');
  $('#divConfigDialog').removeAttr('hidden');
  $('#divConfigDialog #divConfigProps input').get(0).focus();
};

function buildList() {
  let rendered = '';
  rendered += '<h3>Edit Config</h3>';
  rendered += '<div class="dailogClose">&times;</div>';
  rendered += '<div id="divConfigProps" class="dialogForm">';
  rendered += '<label>Project Dir</label>';
  rendered += '<input id="txtProjectDir"/>';
  rendered += '<label>Base Url</label>';
  rendered += '<input id="txtBaseUrl"/>';
  rendered += '<label>Golden</label>';
  rendered += '<input id="txtGolden"/>';
  rendered += '<label>Delay</label>';
  rendered += '<input id="txtDelay"/>';
  rendered += '<label>Debug</label>';
  rendered += '<input id="txtDebug"/>';
  rendered += '<label>Bail</label>';
  rendered += '<input id="txtBail"/>';
  rendered += '<label>Default Time</label>';
  rendered += '<input id="txtDefaultTime"/>';
  rendered += '<label>File Type</label>';
  rendered += '<input id="txtFileType"/>';
  rendered += '<label>Quality</label>';
  rendered += '<input id="txtQuality"/>';
  // dimensions
  // clipRegions
  rendered += '<label>Test Directory</label>';
  rendered += '<input id="txtTestDirectory"/>';
  rendered += '<label>Golden Directory</label>';
  rendered += '<input id="txtGoldenDirectory"/>';
  rendered += '<label>Diff Directory</label>';
  rendered += '<input id="txtDiffDirectory"/>';
  rendered += '<label>Threshold</label>';
  rendered += '<input id="txtThreshold"/>';
  rendered += '<label>Tests</label>';
  rendered += '<input id="txtTests"/>';
  rendered += '<label>Delay Modifier</label>';
  rendered += '<input id="txtDelayModifier"/>';
  rendered += '</div>';
  rendered += '<button id="btnPostConfig" class="dialogBtn green button">Save</button>';
  $('#divConfigDialog').html(rendered);
}

function clearValidation() {
  // $('#divConfigDialog #divConfigProps #txtName').removeAttr('invalid');
  // $('#divConfigDialog #divConfigProps #txtFile').removeAttr('invalid');
}

function hideConfigDialog() {
  $('#divBackdrop').attr('hidden', '');
  $('#divConfigDialog').attr('hidden', '');
}

buildList();

$('#divConfigDialog .dailogClose').click(hideConfigDialog);

