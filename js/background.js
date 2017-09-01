/* globals chrome */
var connections = {};
chrome.runtime.onConnect.addListener(function (devToolsConnection) {
  var devToolsListener = function (message, sender, sendResponse) {
    if (message.name === 'execute-script') {
      connections[message.tabId] = devToolsConnection;
      chrome.tabs.executeScript(message.tabId, { file: message.scriptToInject });
    } else {
      chrome.tabs.sendMessage(message.tabId, message, function (response) {
        devToolsConnection.postMessage(response);
      });
    }
  };
  // add the listener
  devToolsConnection.onMessage.addListener(devToolsListener);

  devToolsConnection.onDisconnect.addListener(function () {
    devToolsConnection.onMessage.removeListener(devToolsListener);
  });

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
      devToolsConnection.postMessage({name: 'tab-updated'});
    }
  });
});

// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Messages from content scripts should have sender.tab set
  console.log('bs, msg from content-script: ', request);
  if (sender.tab) {
    var tabId = sender.tab.id;
    if (tabId in connections) {
      connections[tabId].postMessage(request);
    } else {
      console.log('Tab not found in connection list.');
    }
  } else {
    console.log('sender.tab not defined.');
  }
  return true;
});
