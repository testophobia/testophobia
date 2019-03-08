/* global $, Testophobia, chrome */
let enabled = false;

const bgConnection = chrome.runtime.connect({name: 'sidebar'});

bgConnection.onMessage.addListener(request => {
  switch (request.name) {
    case 'testophobia-content-ready':
      Testophobia.setSelectedElement();
      Testophobia.retrieveActions();
      if (localStorage.getItem('testophobia-test-loading'))
        localStorage.removeItem('testophobia-test-loading');
      else
        Testophobia.chooseTest();
      break;
    case 'testophobia-page-refresh':
      if (enabled) bgConnection.postMessage({name: 'testophobia-init', tabId: chrome.devtools.inspectedWindow.tabId});
      break;
  }
});

enabled = true;
bgConnection.postMessage({name: 'testophobia-init', tabId: chrome.devtools.inspectedWindow.tabId});

Testophobia.showAlert = (title, message) => {
  $('#titleAlert').text(title);
  $('#divAlertMessage').text(message);
  $('#divBackdrop').removeAttr('hidden');
  $('#divAlert').removeAttr('hidden');
};

function hideAlert() {
  $('#divBackdrop').attr('hidden', '');
  $('#divAlert').attr('hidden', '');
}

$('#divAlertClose').click(hideAlert);
$('#btnAlertClose').click(hideAlert);