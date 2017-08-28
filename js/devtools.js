/* globals chrome */

function postMessage (receiver, name, content) {
  receiver.postMessage({
    name: name,
    content: content,
    tabId: chrome.devtools.inspectedWindow.tabId
  });
}

function requestInformation (backgroundConnection) {
  postMessage(backgroundConnection, 'get-definitions');
  postMessage(backgroundConnection, 'get-dep-tree');
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
          postExecuteContentScript();
        });

        backgroundPageConnection.onMessage.addListener(function (message) {
          var componentVwr = extPanelWin.document.querySelector('cubx-generic-component-viewer');
          var depTreeVwr = extPanelWin.document.querySelector('cubx-dep-tree-viewer');
          var vwrHeight = extPanelWin.document.body.scrollHeight * 0.7 + 'px';
          switch (message.name) {
            case 'set-definitions':
              componentVwr.setViewerHeight(vwrHeight);
              componentVwr.setDefinitions(message.content);
              extPanelWin.handleInitialScale('componentViewerT', componentVwr);
              break;
            case 'set-dep-tree':
              depTreeVwr.setHeight(vwrHeight);
              depTreeVwr.setDepTree(message.content);
              extPanelWin.handleInitialScale('depsTreeViewerT', depTreeVwr);
              break;
            case 'cif-ready':
              requestInformation(backgroundPageConnection);
              break;
            case 'cif-dom-update':
              requestInformation(backgroundPageConnection);
              break;
            case 'tab-updated':
              postExecuteContentScript();
              break;
          }
        });

        var postExecuteContentScript = function () {
          // Relay the tab ID to the background page
          backgroundPageConnection.postMessage({
            name: 'execute-script',
            tabId: chrome.devtools.inspectedWindow.tabId,
            scriptToInject: 'js/content_script.js'
          });
          initialised = true;
        };
      }
    });
  }
);
