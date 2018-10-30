/* global chrome */
const btnEnable = document.getElementById('btnEnable');
const divControls = document.getElementById('divControls');
const divSelected = document.getElementById('divSelected');
const ddActionType = document.getElementById('ddActionType');
const btnAddAction = document.getElementById('btnAddAction');
const actionsList = document.getElementById('actionsList');
const btnExport = document.getElementById('btnExport');
const divExport = document.getElementById('divExport');
const divBackdrop = document.getElementById('divBackdrop');
const divDetails = document.getElementById('divDetails');
const btnSaveEdits = document.getElementById('btnSaveEdits');
const actions = [];

const bgConnection = chrome.runtime.connect({name: 'sidebar'});

bgConnection.onMessage.addListener(request => {
  switch (request.name) {
    case 'testophobia-content-ready':
      setSelectedElement();
      renderActions();
      break;
  }
});

btnEnable.onclick = () => {
  btnEnable.setAttribute('hidden', '');
  divControls.removeAttribute('hidden');
  bgConnection.postMessage({
    name: 'testophobia-init',
    tabId: chrome.devtools.inspectedWindow.tabId
  });
};

btnAddAction.onclick = () => {
  actions.push({type:ddActionType.value,target:divSelected.innerHTML});
  renderActions();
  //TODO: scroll to bottom
};

actionsList.onclick = e => {
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
        showDialog();
        break;
      case 'del':
        actions.splice(Number(svg.getAttribute('data-row')), 1);
        renderActions();
        //TODO - if action has properties, pop the dialog
        break;
    }
  }
};

btnExport.onclick = copyActionsToClipboard;

btnSaveEdits.onclick = () => {
  //TODO: apply the edits
  hideDialog();
};

function setSelectedElement() {
  chrome.devtools.inspectedWindow.eval(`(function(){return getUniqueSelector($0);}())`,
    {useContentScriptContext: true},
    result => {
      divSelected.innerHTML = result || '(none)';
    }
  );
}

function renderActions() {
  let rendered = '';
  actions.forEach((a,idx) => {
    rendered += `<tr>
  <td title="${a.type}">${a.type}</td>
  <td title="${a.target}">${a.target}</td>
  <td title="Play"><svg data-row="${idx}" data-type="play" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></g><svg></td>
  <td title="Edit"><svg data-row="${idx}" data-type="edit" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></g><svg></td>
  <td title="Delete"><svg data-row="${idx}" data-type="del" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g><svg></td>
</tr>`;
  });
  actionsList.innerHTML = `<table>${rendered}</table>`;
}

function showDialog() {
  divBackdrop.removeAttribute('hidden');
  divDetails.removeAttribute('hidden');
}

function hideDialog() {
  divBackdrop.setAttribute('hidden', '');
  divDetails.setAttribute('hidden', '');
}

function copyActionsToClipboard() {
  divExport.innerHTML = JSON.stringify(actions);
  const sel = window.getSelection();
  const snipRange = document.createRange();
  snipRange.selectNodeContents(divExport);
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

chrome.devtools.panels.elements.onSelectionChanged.addListener(setSelectedElement);
