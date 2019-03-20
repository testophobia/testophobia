/* global $, Testophobia */

Testophobia.showConfigDialog = () => {
  clearValidation();
  fetchConfig().then(() => {
    buildList();
    $('#divBackdrop').removeAttr('hidden');
    $('#divConfigDialog').removeAttr('hidden');
    $('#divConfigDialog #divConfigProps input').get(0).focus();
    $('#divConfigDialog .dailogClose').click(hideConfigDialog);
  });
};

function fetchConfig() {
  return new Promise((resolve, reject) => {
    fetch(`${Testophobia.serverUrl}/config`)
      .then(response => response.json())
      .then(configResult => {
        Testophobia.config = configResult;
        resolve();
      })
      .catch(reject);
    });
}

function cleanParam(param) {
  return (param == null) ? '' : param;
}

function buildList() {
  let rendered = '';
  rendered += '<h3>Edit Config</h3>';
  rendered += '<div class="dailogClose">&times;</div>';
  rendered += '<div id="divConfigProps" class="dialogForm">';
  rendered += '<label>Project Dir</label>';
  rendered += `<input id="txtProjectDir" value="${cleanParam(Testophobia.config.projectDir)}"/>`;
  rendered += '<label>Base Url</label>';
  rendered += `<input id="txtBaseUrl" value="${cleanParam(Testophobia.config.baseUrl)}"/>`;
  rendered += '<label>Delay</label>';
  rendered += `<input id="txtDelay" value="${cleanParam(Testophobia.config.delay)}"/>`;
  rendered += `<input id="chkBail" type="checkbox" ${(Testophobia.config.bail === true) ? 'checked' : ''}/>`;
  rendered += '<label for="chkBail">Bail on first failure</label>';
  rendered += '<label>Default Time</label>';
  rendered += `<input id="txtDefaultTime" value="${cleanParam(Testophobia.config.defaultTime)}"/>`;
  rendered += '<label>File Type</label>';
  rendered += `<input id="txtFileType" value="${cleanParam(Testophobia.config.fileType)}"/>`;
  rendered += '<label>Quality</label>';
  rendered += `<input id="txtQuality" value="${cleanParam(Testophobia.config.quality)}"/>`;
  // dimensions
  // clipRegions
  rendered += '<label>Test Directory</label>';
  rendered += `<input id="txtTestDirectory" value="${cleanParam(Testophobia.config.testDirectory)}"/>`;
  rendered += '<label>Golden Directory</label>';
  rendered += `<input id="txtGoldenDirectory" value="${cleanParam(Testophobia.config.goldenDirectory)}"/>`;
  rendered += '<label>Diff Directory</label>';
  rendered += `<input id="txtDiffDirectory" value="${cleanParam(Testophobia.config.diffDirectory)}"/>`;
  rendered += '<label>Threshold</label>';
  rendered += `<input id="txtThreshold" value="${cleanParam(Testophobia.config.threshold)}"/>`;
  rendered += '<label>Tests</label>';
  rendered += `<input id="txtTests" value="${cleanParam(Testophobia.config.tests)}"/>`;
  rendered += '<label>Delay Modifier</label>';
  rendered += `<input id="txtDelayModifier" value="${cleanParam(Testophobia.config.delayModifier)}"/>`;
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
