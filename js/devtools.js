/* globals chrome */
(function () {
  var CONNECTION_VWR_TAB_ID = 'componentViewerT';
  function postMessage (receiver, name, content) {
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
          var componentVwr = extPanelWin.document.querySelector('cubx-generic-component-viewer');
          var depTreeVwr = extPanelWin.document.querySelector('cubx-dep-tree-viewer');
          var backgroundPageConnection = chrome.runtime.connect({
            name: 'devtools-connection'
          });
          extPanelWin.document.addEventListener('cifReady', function () {
            postExecuteContentScript();
            var reloadB = extPanelWin.document.querySelector('#reloadB');
            reloadB.removeAttribute('disabled');
            reloadB.addEventListener('click', function () {
              requestInformation();
            });
            extPanelWin.addOnShownListener('componentViewerT', componentVwr, requestInformation);
            extPanelWin.addOnShownListener('depsTreeViewerT', depTreeVwr, requestInformation, true);
          });

          backgroundPageConnection.onMessage.addListener(function (message) {
            switch (message.name) {
              case 'set-definitions':
                componentVwr.setDefinitions(message.content);
                break;
              case 'set-dep-tree':
                depTreeVwr.setDepTree(message.content);
                break;
              case 'cif-ready':
                requestInformation();
                break;
              case 'tab-updated':
                postExecuteContentScript();
                break;
              case 'devtools-close':
                postMessage(backgroundPageConnection, 'devtools-close');
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

          var requestInformation = function () {
            var activeTab = extPanelWin.document.querySelector('ul.nav-tabs li.active a');
            if (activeTab.id === CONNECTION_VWR_TAB_ID) {
              postMessage(backgroundPageConnection, 'get-definitions');
            } else {
              postMessage(backgroundPageConnection, 'get-dep-tree');
            }
          };
        }
      });
    }
  );
})();
