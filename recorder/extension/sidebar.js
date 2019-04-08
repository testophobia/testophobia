/* global Testophobia */
(() => {
let enabled = false;

const bgConnection = Testophobia.chrome.runtime.connect({name: 'sidebar'});

bgConnection.onMessage.addListener(request => {
  switch (request.name) {
    case 'testophobia-content-ready':
      Testophobia.setSelectedElement();
      if (localStorage.getItem('testophobia-test-loading'))
        localStorage.removeItem('testophobia-test-loading');
      else
        Testophobia.chooseTest();
      break;
    case 'testophobia-page-refresh':
      if (enabled) {
        // this breaks the case when we walk through a test that spans multiple pages.  Cant remember what edge case required this.  Will leave temporarily.
        // bgConnection.postMessage({name: 'testophobia-init', tabId: Testophobia.chrome.devtools.inspectedWindow.tabId});
      }
      break;
  }
});

enabled = true;
bgConnection.postMessage({name: 'testophobia-init', tabId: Testophobia.chrome.devtools.inspectedWindow.tabId});
})();
