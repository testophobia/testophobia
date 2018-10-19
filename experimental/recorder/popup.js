/* global chrome */
let btnNotrecording = document.getElementById('notrecording');
let btnRecording = document.getElementById('recording');
let txtActions = document.getElementById('recordedActions');

function updateRecordedActions() {
  chrome.storage.sync.get(["testophobia-actions"], function (result) {
    txtActions.innerHTML = result['testophobia-actions'].reduce((p, c) => `${p}${c.action} [${c.element}]\n`, '');
  });
}

function toggleRecording(isRecording) {
  if (isRecording) {
    btnNotrecording.setAttribute('hidden', '');
    btnRecording.removeAttribute('hidden');
  } else {
    btnRecording.setAttribute('hidden', '');
    btnNotrecording.removeAttribute('hidden');
  }
}

btnRecording.onclick = function () {
  toggleRecording(false);
  chrome.runtime.sendMessage({messageType: 'testophobia-event', event: 'stop-recording'});
};

btnNotrecording.onclick = function () {
  toggleRecording(true);
  txtActions.innerHTML = '';
  chrome.runtime.sendMessage({messageType: 'testophobia-event', event: 'start-recording'});
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.messageType === 'testophobia-event' && request.event === 'actions-updated') {
    updateRecordedActions();
  }
});

function init() {
  chrome.storage.sync.get('testophobia-status', function (data) {
    toggleRecording(Boolean((data['testophobia-status'] === 'recording')));
    updateRecordedActions();
  });
}

init();