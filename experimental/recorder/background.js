/* global chrome */
(function() {
  let tabIdToPortMap = {};
  let portIdToTabIdMap = {};
  let portIdToPortMap = {};
  let lastPortId = 0;
  chrome.runtime.onConnect.addListener(port => {
    let portId;
    port.onMessage.addListener(request => {
      switch (request.name) {
        case 'testophobia-init':
          portId = ++lastPortId;
          tabIdToPortMap[request.tabId] = port;
          portIdToTabIdMap[portId] = request.tabId;
          portIdToPortMap[portId] = port;
          chrome.tabs.executeScript(request.tabId, {file: 'content-script.js'}, () => {
            port.postMessage({name: 'testophobia-content-ready'});
          });
          break;
      }
    });

    port.onDisconnect.addListener(() => {
      let tabId = portIdToTabIdMap[portId];
      delete portIdToTabIdMap[portId];
      delete portIdToPortMap[portId];
      delete tabIdToPortMap[tabId];
    });

    chrome.runtime.onMessage.addListener((request, sender) => {
      let port = tabIdToPortMap[sender.tab.id];
      if (!port) return;
      // switch (request.name) {
      //   case 'inspected-element-changed':
      //     console.dir(request.key);
      //     port.postMessage({
      //       name: 'inspected-element-changed',
      //       key: request.key
      //     });
      //     break;
      // }
    });
  });
})();