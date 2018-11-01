/* global $, chrome */
const actions = [];
const bgConnection = chrome.runtime.connect({name: 'sidebar'});
let selectedEl, dialogIdx;

bgConnection.onMessage.addListener(request => {
  switch (request.name) {
    case 'testophobia-content-ready':
      setSelectedElement();
      renderActions();
      break;
  }
});

$('#btnEnable').click(() => {
  $('#btnEnable').attr('hidden', '');
  $('#divControls').removeAttr('hidden');
  bgConnection.postMessage({
    name: 'testophobia-init',
    tabId: chrome.devtools.inspectedWindow.tabId
  });
});

$('#btnAddAction').click(() => {
  actions.push({type:$('#ddActionType').val(),target:$('#divSelected').html()});
  renderActions();
  //TODO: scroll to bottom
});

$('#actionsList').click(e => {
  const getSVG = el => {
    if (el.tagName.toLowerCase() === 'svg') return el;
    while (el.parentNode) {
      el = el.parentNode;
      if (el.tagName.toLowerCase() === 'svg') return el;
    }
    return null;
  };
  const svg = getSVG(e.target);
  if (svg) {
    switch (svg.getAttribute('data-type')) {
      case 'play':
        //TODO - invoke the action (might not make sense for some, particularly hover)
        break;
      case 'edit':
        dialogIdx = Number(svg.getAttribute('data-row'));
        showDialog();
        break;
      case 'del':
        actions.splice(Number(svg.getAttribute('data-row')), 1);
        renderActions();
        //TODO - if action has properties, pop the dialog
        break;
    }
  }
});

$('#btnExport').click(copyActionsToClipboard);

$('#btnSaveEdits').click(() => {
  if (/^[1-9]\d*$/.test($('#divFields #txtDelay').val()))
    actions[dialogIdx].delay = Number($('#divFields #txtDelay').val());
  else
    delete actions[dialogIdx].delay;
  if ($('#divFields #chkSkipScreen').prop('checked'))
    actions[dialogIdx].skipScreen = true;
  else
    delete actions[dialogIdx].skipScreen;
  $('#divAddlFields input').each(function() {
    actions[dialogIdx][this.id.substr(3)] = $(this).val();
  });
  hideDialog();
});

$('#divDetailsClose').click(hideDialog);

function setSelectedElement() {
  chrome.devtools.inspectedWindow.eval(`(function(){return getUniqueSelector($0);}())`,
    {useContentScriptContext: true},
    result => {
      selectedEl = result || '(none)';
      $('#divSelected').text(selectedEl);
    }
  );
}

function renderActions() {
  let rendered = '';
  if (actions.length) {
    $('#actionsLbl').removeAttr('hidden');
    $('#btnExport').removeAttr('hidden');
  } else {
    $('#actionsLbl').attr('hidden', '');
    $('#btnExport').attr('hidden', '');
  }
  actions.forEach((a,idx) => {
    rendered += `<tr>
  <td title="${buildActionString(a)}">${a.type}</td>
  <td title="${a.target}">${a.target}</td>
  <td title="Play"><svg data-row="${idx}" data-type="play" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></g><svg></td>
  <td title="Edit"><svg data-row="${idx}" data-type="edit" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></g><svg></td>
  <td title="Delete"><svg data-row="${idx}" data-type="del" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g><svg></td>
</tr>`;
  });
  $('#actionsList').html(`<table>${rendered}</table>`);
}

function showDialog() {
  let action = actions[dialogIdx];
  $('#divDetailsTitle').text(`${action.type} - ${selectedEl}`);
  let fieldsHtml = '';
  const addField = (label, prop) => `\n      <label>${label}</label>\n      <input id="txt${prop}" value="${action[prop] || ''}"/>`;
  switch (action.type) {
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
      fieldsHtml = `${addField('Key Code', 'keyCode')}`;
      break;
  }
  $('#divAddlFields').html(fieldsHtml + '\n    ');
  $('#divFields #txtDelay').val(action.delay || '');
  $('#divFields #chkSkipScreen').prop('checked', action.skipScreen || false);
  $('#divBackdrop').removeAttr('hidden');
  $('#divDetails').removeAttr('hidden');
}

function hideDialog() {
  $('#divBackdrop').attr('hidden', '');
  $('#divDetails').attr('hidden', '');
  renderActions();
}

function copyActionsToClipboard() {
  $('#divExport').html(JSON.stringify(actions));
  const sel = window.getSelection();
  const snipRange = document.createRange();
  snipRange.selectNodeContents($('#divExport').get(0));
  sel.removeAllRanges();
  sel.addRange(snipRange);
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error(err);
  }
  sel.removeAllRanges();
  //TODO: let user know it was successful
}

function buildActionString(action) {
  let actionString = '';
  for (let prop in action) {
    if (prop !== 'target') actionString += `\n${prop}: ${action[prop]}`;
  }
  return actionString.slice(1);
}

chrome.devtools.panels.elements.onSelectionChanged.addListener(setSelectedElement);
