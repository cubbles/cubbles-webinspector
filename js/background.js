/* globals chrome */
var connections = {};

// TODO: check how to use it
function sendMessageToTab (tabId, message, responseCb) {
  chrome.tabs.sendMessage(tabId, message, responseCb);
}
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
});

// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Messages from content scripts should have sender.tab set
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
