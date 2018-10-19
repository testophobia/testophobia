/* global chrome */
chrome.storage.sync.set({'testophobia-actions': []});
document.body.addEventListener('click', function (e) {
  let nodeStr = e.target.nodeName.toLowerCase();
  if (e.target.id) nodeStr += '#' + e.target.id;
  chrome.runtime.sendMessage({messageType: 'testophobia-action', action: 'click', element: nodeStr});
}, false);
