/* global $, Testophobia */

Testophobia.showConfigDialog = () => {
  $('#divBackdrop').removeAttr('hidden');
  $('#divConfigDialog').removeAttr('hidden');
  $('#divConfigDialog #divConfigProps input').get(0).focus();
  $('#divConfigDialog .dialogClose').click(hideConfigDialog);
  $('#divConfigDialog #btnPostConfig').click(saveConfig);
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

function saveConfig() {
  Testophobia.validation.clear('#divConfigDialog #divConfigProps');
  Testophobia.validation.validate({name:'projectDir',type:'string',selector:'#divConfigDialog #divConfigProps #txtProjectDir',required:false}, Testophobia.config);
  Testophobia.validation.validate({name:'baseUrl',type:'string',selector:'#divConfigDialog #divConfigProps #txtBaseUrl',required:false}, Testophobia.config);
  Testophobia.validation.validate({name:'delay',type:'number',selector:'#divConfigDialog #divConfigProps #txtDelay',required:false}, Testophobia.config);
  Testophobia.validation.validate({name:'bail',type:'boolean',selector:'#divConfigDialog #divConfigProps #chkBail',required:false}, Testophobia.config);
  Testophobia.validation.validate({name:'defaultTime',type:'number',selector:'#divConfigDialog #divConfigProps #txtDefaultTime',required:false}, Testophobia.config);
  Testophobia.validation.validate({name:'fileType',type:'string',selector:'#divConfigDialog #divConfigProps #txtFileType',required:false}, Testophobia.config);
  Testophobia.validation.validate({name:'quality',type:'number',selector:'#divConfigDialog #divConfigProps #txtQuality',required:false}, Testophobia.config);
  Testophobia.validation.validate({name:'testDirectory',type:'string',selector:'#divConfigDialog #divConfigProps #txtTestDirectory',required:false}, Testophobia.config);
  Testophobia.validation.validate({name:'goldenDirectory',type:'string',selector:'#divConfigDialog #divConfigProps #txtGoldenDirectory',required:false}, Testophobia.config);
  Testophobia.validation.validate({name:'diffDirectory',type:'string',selector:'#divConfigDialog #divConfigProps #txtDiffDirectory',required:false}, Testophobia.config);
  Testophobia.validation.validate({name:'threshold',type:'decimal',selector:'#divConfigDialog #divConfigProps #txtThreshold',required:false}, Testophobia.config);
  Testophobia.validation.validate({name:'tests',type:'string',selector:'#divConfigDialog #divConfigProps #txtTests',required:false}, Testophobia.config);
  Testophobia.validation.validate({name:'delayModifier',type:'decimal',selector:'#divConfigDialog #divConfigProps #txtDelayModifier',required:true}, Testophobia.config);
  fetch(`${Testophobia.serverUrl}/config`,
    {
      method: 'post',
      body: JSON.stringify(Testophobia.config)
    }).then(() => {
      hideConfigDialog();
      setTimeout(() => Testophobia.showAlert('Success', 'Config saved.', () => {
        Testophobia.chooseTest();
      }), 100);
    });
}

function cleanParam(param) {
  return (param == null) ? '' : param;
}

function buildList() {
  let rendered = '';
  rendered += '<h3>Edit Config</h3>';
  rendered += '<div class="dialogClose">&times;</div>';
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
  rendered += '<div class="listHeader"><label>Dimensions</label><button id="btnAddDimension" class="link-button">Add</button></div>';
  rendered += '<ul id="lstDimensions" class="dialogList"></ul>';
  rendered += '<div class="listHeader"><label>Clip Regions</label><button id="btnAddClipRegion" class="link-button">Add</button></div>';
  rendered += '<ul id="lstClipRegions" class="dialogList"></ul>';
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
  loadDimensions();
}

function dimensionsChanged() {
  Testophobia.showConfigDialog();
  loadDimensions();
}

function loadDimensions() {
  Testophobia.buildListControl(
    '#divConfigProps #lstDimensions',
    Testophobia.config.dimensions,
    f => `${f.type} - ${f.width}:${f.height} ${(f.scale) ? f.scale : ''}`,
    e => {
      Testophobia.editingDimensionIndex = $(e.currentTarget).attr('data-row');
      hideConfigDialog();
      Testophobia.showDimensionsDialog(Testophobia.config, dimensionsChanged);
    },
    e => {
      Testophobia.config.dimensions.splice($(e.currentTarget).attr('data-row'), 1);
      loadDimensions();
    });
}

function addDimension() {
  hideConfigDialog();
  Testophobia.showDimensionsDialog(Testophobia.config, dimensionsChanged);
}

function clipRegionsChanged() {
  Testophobia.showConfigDialog();
  loadClipRegions();
}

function loadClipRegions() {
  Testophobia.buildListControl(
    '#divConfigProps #lstClipRegions',
    Testophobia.config.clipRegions,
    f => `${f.type} - ${f.left || 0}:${f.top || 0}:${f.width || f.right || '100%'}:${f.height || f.bottom || '100%'}`,
    e => {
      Testophobia.editingClipRegionsIndex = $(e.currentTarget).attr('data-row');
      hideConfigDialog();
      //model, modelProp, idxField, dlgSelector, frmSelector, onDone
      Testophobia.showClipRegionsDialog(Testophobia.config, 'clipRegions', 'editingClipRegionsIndex', '#divRegionsDialog', '#divRegionsProps', clipRegionsChanged);
    },
    e => {
      Testophobia.config.clipRegions.splice($(e.currentTarget).attr('data-row'), 1);
      loadClipRegions();
    });
}

function addClipRegion() {
  hideConfigDialog();
  Testophobia.showClipRegionsDialog(Testophobia.config, 'clipRegions', 'editingClipRegionsIndex', '#divRegionsDialog', '#divRegionsProps', clipRegionsChanged);
}

function hideConfigDialog() {
  $('#divBackdrop').attr('hidden', '');
  $('#divConfigDialog').attr('hidden', '');
}

fetchConfig().then(() => {
  buildList();
  $('#btnAddDimension').click(addDimension);
  $('#btnAddClipRegion').click(addClipRegion);
});
