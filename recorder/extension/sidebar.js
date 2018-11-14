/* global $, Testophobia, chrome */
let enabled = false;

//TODO: if the page reloads mid-session, the content script must be re-inserted

const bgConnection = chrome.runtime.connect({name: 'sidebar'});

bgConnection.onMessage.addListener(request => {
  switch (request.name) {
    case 'testophobia-content-ready':
      Testophobia.setSelectedElement();
      Testophobia.retrieveActions();
      break;
    case 'testophobia-page-refresh':
      if (enabled) bgConnection.postMessage({name: 'testophobia-init', tabId: chrome.devtools.inspectedWindow.tabId});
      break;
  }
});

enabled = true;
bgConnection.postMessage({name: 'testophobia-init', tabId: chrome.devtools.inspectedWindow.tabId});
