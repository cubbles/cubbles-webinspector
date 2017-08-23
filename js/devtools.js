/* globals chrome */
chrome.devtools.panels.create(
  'Cubbles',
  'cubbles.png',
  'index.html',
  function (panel) {
    var initialised = false;
    panel.onShown.addListener(function (extPanelWin) {
      if (!initialised) {
        // console.log('ds: send  connection window');
        var backgroundPageConnection = chrome.runtime.connect({
          name: 'devtools-connection'
        });

        extPanelWin.document.addEventListener('cifReady', function () {
          backgroundPageConnection.postMessage({
            name: 'get-definitions',
            tabId: chrome.devtools.inspectedWindow.tabId
          });
        });

        backgroundPageConnection.onMessage.addListener(function (message) {
          switch (message.name) {
            case 'set-definitions':
              var componentVwr = extPanelWin.document.querySelector('cubx-generic-component-viewer');
              componentVwr.setViewerHeight(componentVwr.parentNode.scrollHeight * 0.8 + 'px');
              componentVwr.setDefinitions(message.definitions);
              break;
          }
        });

        // Relay the tab ID to the background page
        backgroundPageConnection.postMessage({
          name: 'execute-script',
          tabId: chrome.devtools.inspectedWindow.tabId,
          scriptToInject: 'js/content_script.js'
        });
        initialised = true;
      }
    });
  }
);
