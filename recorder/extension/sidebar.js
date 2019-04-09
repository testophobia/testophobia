/* global Testophobia */
(() => {
let enabled = false;

const bgConnection = Testophobia.chrome.runtime.connect({name: 'sidebar'});

bgConnection.onMessage.addListener(request => {
  switch (request.name) {
    case 'testophobia-content-ready':
      Testophobia.setSelectedElement();
      if (!localStorage.getItem('testophobia-test')) Testophobia.chooseTest();
      break;
    case 'testophobia-page-refresh':
      if (enabled) {
        bgConnection.postMessage({name: 'testophobia-init', tabId: Testophobia.chrome.devtools.inspectedWindow.tabId});
      }
      break;
  }
});

enabled = true;
bgConnection.postMessage({name: 'testophobia-init', tabId: Testophobia.chrome.devtools.inspectedWindow.tabId});
})();
