/* globals chrome */

function postMessage(receiver, name, content) {
  receiver.postMessage({
    name: name,
    content: content,
    tabId: chrome.devtools.inspectedWindow.tabId
  });
}

chrome.devtools.panels.create(
  'Cubbles',
  'cubbles.png',
  'index.html',
  function (panel) {
    var initialised = false;
    panel.onShown.addListener(function (extPanelWin) {
      if (!initialised) {
        var backgroundPageConnection = chrome.runtime.connect({
          name: 'devtools-connection'
        });

        extPanelWin.document.addEventListener('cifReady', function () {
          postMessage(backgroundPageConnection, 'get-base-url');
          postMessage(backgroundPageConnection, 'get-definitions');
          postMessage(backgroundPageConnection, 'get-root-deps');
        });

        backgroundPageConnection.onMessage.addListener(function (message) {
          var componentVwr = extPanelWin.document.querySelector('cubx-generic-component-viewer');
          var depTreeVwr = extPanelWin.document.querySelector('cubx-deps-tree-viewer');
          var vwrHeight = (componentVwr.parentNode.scrollHeight > 0
              ? componentVwr.parentNode.scrollHeight
              : depTreeVwr.parentNode.scrollHeight) * 0.8 + 'px';
          switch (message.name) {
            case 'set-base-url':
              depTreeVwr.setBaseUrl(message.content);
              break;
            case 'set-definitions':
              componentVwr.setViewerHeight(vwrHeight);
              componentVwr.setDefinitions(message.content);
              break;
            case 'set-root-deps':
              depTreeVwr.setHeight(vwrHeight);
              depTreeVwr.setRootDependencies(message.content);
              depTreeVwr.setScale('auto');
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
