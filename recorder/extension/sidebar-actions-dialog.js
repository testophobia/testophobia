/* global $, Testophobia, chrome */
Testophobia.dialogActionIndex = -1;
Testophobia.dialogActionType;

Testophobia.showDialog = (actionIdx) => {
  Testophobia.dialogActionIndex = actionIdx;
  Testophobia.dialogActionType = Testophobia.actions[Testophobia.dialogActionIndex].type;
  $('#dlgAction').on('change', dropdownChanged);
  layoutDialog();
};

Testophobia.hideDialog = () => {
  $('#divBackdrop').attr('hidden', '');
  $('#divDetails').attr('hidden', '');
  $('#dlgAction').off('change');
  Testophobia.actionsChanged();
};

function dropdownChanged() {
  Testophobia.dialogActionType = $('#dlgAction').val();
  layoutDialog();
}

function layoutDialog() {
  let action = Testophobia.actions[Testophobia.dialogActionIndex];
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
  $('#divFields #txtDelay').val(action.delay || '');
  $('#divFields #chkSkipScreen').prop('checked', action.skipScreen || false);
  $('#divBackdrop').removeAttr('hidden');
  $('#divDetails').removeAttr('hidden');
  $('#divFields input').get(0).focus();
}

$('#divDetailsClose').click(Testophobia.hideDialog);

$('#btnSaveEdits').click(() => {
  if (/^[1-9]\d*$/.test($('#divFields #txtDelay').val()))
    Testophobia.actions[Testophobia.dialogActionIndex].delay = Number($('#divFields #txtDelay').val());
  else
    delete Testophobia.actions[Testophobia.dialogActionIndex].delay;
  if ($('#divFields #chkSkipScreen').prop('checked'))
    Testophobia.actions[Testophobia.dialogActionIndex].skipScreen = true;
  else
    delete Testophobia.actions[Testophobia.dialogActionIndex].skipScreen;
  Testophobia.actions[Testophobia.dialogActionIndex].type = Testophobia.dialogActionType;
  Testophobia.actions[Testophobia.dialogActionIndex].target = $('#txtTarget').val();
  $('#divAddlFields input').each(function () {
    Testophobia.actions[Testophobia.dialogActionIndex][this.id.substr(3)] = $(this).val();
  });
  Testophobia.hideDialog();
});

Testophobia.setSelectedElement = () => {
  chrome.devtools.inspectedWindow.eval(`(function(){return getUniqueSelector($0);}())`,
    {useContentScriptContext: true},
    result => {
      $('#txtTarget').val(result);
    }
  );
};

chrome.devtools.panels.elements.onSelectionChanged.addListener(Testophobia.setSelectedElement);
