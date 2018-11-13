/* global $, chrome */
const bgConnection = chrome.runtime.connect({name: 'sidebar'});
let actions = [];
let selectedEl, dialogIdx, enabled = false;

//TODO: if the page reloads mid-session, the content script must be re-inserted

bgConnection.onMessage.addListener(request => {
  switch (request.name) {
    case 'testophobia-content-ready':
      setSelectedElement();
      retrieveActions();
      break;
    case 'testophobia-page-refresh':
      if (enabled) bgConnection.postMessage({name: 'testophobia-init', tabId: chrome.devtools.inspectedWindow.tabId});
      break;
  }
});

$('#btnEnable').click(() => {
  enabled = true;
  $('#btnEnable').attr('hidden', '');
  $('#divControls').removeAttr('hidden');
  setCopyImage();
  bgConnection.postMessage({name: 'testophobia-init', tabId: chrome.devtools.inspectedWindow.tabId});
});

$('#btnAddAction').click(() => {
  const actionType = $('#ddActionType').val();
  actions.push({type: actionType, target: $('#divSelected').html()});
  actionsChanged();
  const list = $('#actionsList').get(0);
  list.scrollTop = list.scrollHeight;
  if (['setProperty', 'setAttribute', 'removeAttribute', 'scroll', 'keypress', 'input'].indexOf(actionType) >= 0)
    showDialog(actions.length - 1);
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
    const actionIdx = Number(svg.getAttribute('data-row'));
    switch (svg.getAttribute('data-type')) {
      case 'play':
        playAction(actionIdx);
        break;
      case 'edit':
        showDialog(actionIdx);
        break;
      case 'del':
        actions.splice(actionIdx, 1);
        actionsChanged();
        break;
    }
  }
});

$('#btnClearAll').click(() => {
  actions = [];
  actionsChanged();
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
  $('#divAddlFields input').each(function () {
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

function actionsChanged() {
  storeActions();
  let rendered = '';
  if (actions.length) {
    $('#actionsLbl').removeAttr('hidden');
    $('#btnExport').removeAttr('hidden');
    $('#btnClearAll').removeAttr('hidden');
  } else {
    $('#actionsLbl').attr('hidden', '');
    $('#btnExport').attr('hidden', '');
    $('#btnClearAll').attr('hidden', '');
  }
  actions.forEach((a, idx) => {
    const playTpl = `<svg data-row="${idx}" data-type="play" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></g><svg>`;
    rendered += `<tr>
  <td title="${buildActionString(a)}">${a.type}</td>
  <td title="${a.target}">${a.target}</td>
  <td title="Play">${playTpl}</td>
  <td title="Edit"><svg data-row="${idx}" data-type="edit" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></g><svg></td>
  <td title="Delete"><svg data-row="${idx}" data-type="del" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g><svg></td>
</tr>`;
  });
  if (actions.length && actions.length > 6)
    $('#actionsList').attr('can-scroll', '');
  else
    $('#actionsList').removeAttr('can-scroll');
  $('#actionsList').html(`<table>${rendered}</table>`);
}

function showDialog(actionIdx) {
  dialogIdx = actionIdx;
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

function hideDialog() {
  $('#divBackdrop').attr('hidden', '');
  $('#divDetails').attr('hidden', '');
  actionsChanged();
}

function playAction(actionIdx) {
  let action = actions[actionIdx];
  fetch(`http://localhost:8091/performAction/${encodeURIComponent(JSON.stringify(action))}`, {method: 'post'});
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
  setCopyImage(true);
  setTimeout(() => setCopyImage(), 2000);
}

function setCopyImage(confirm) {
  if (confirm)
    $('#btnExport').html('<svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"></path></g></svg>');
  else
    $('#btnExport').html('<svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"></path></g></svg>');
}

function buildActionString(action) {
  let actionString = '';
  for (let prop in action) {
    if (prop !== 'target') actionString += `\n${prop}: ${action[prop]}`;
  }
  return actionString.slice(1);
}

function storeActions() {
  chrome.storage.sync.set({testophobiaActions: JSON.stringify(actions)});
}

function retrieveActions() {
  chrome.storage.sync.get('testophobiaActions', data => {
    actions = (data && data.testophobiaActions) ? JSON.parse(data.testophobiaActions) : [];
    actionsChanged();
  });
}

chrome.devtools.panels.elements.onSelectionChanged.addListener(setSelectedElement);
