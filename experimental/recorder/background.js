/* global chrome */
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({'testophobia-status': 'stopped'});
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostContains: '.'},
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
  let recordingActive = false;
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.messageType === 'testophobia-action') {
      if (!recordingActive) return;
      chrome.storage.sync.get(["testophobia-actions"], function (result) {
        const arr = result['testophobia-actions'] ? result['testophobia-actions'] : [];
        arr.push({action: request.action, element: request.element});
        chrome.storage.sync.set({'testophobia-actions': arr}, function () {
          chrome.runtime.sendMessage({messageType: 'testophobia-event', event: 'actions-updated'});
        });
      });
    } else if (request.messageType === 'testophobia-event') {
      switch (request.event) {
        case 'start-recording':
          chrome.storage.sync.set({'testophobia-status': 'recording'});
          chrome.storage.sync.set({'testophobia-actions': []});
          recordingActive = true;
          break;
        case 'stop-recording':
          chrome.storage.sync.set({'testophobia-status': 'stopped'});
          recordingActive = false;
          break;
      }
    }
  });
});