/* globals chrome */
(function () {
  var CONNECTION_VWR_TAB_ID = 'componentViewerT';
  var cubblesPanel;
  var cubblesSidepanel;
  var componentVwr;
  var depTreeVwr;
  var postExecuteContentScript = function () {
    // Relay the tab ID to the background page
    backgroundPageConnection.postMessage({
      name: 'execute-script',
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptToInject: 'js/content_script.js'
    });
  };
  var requestInformation = function (force) {
    var activeTab = cubblesPanel.document.querySelector('ul.nav-tabs li.active a');
    if (activeTab.id === CONNECTION_VWR_TAB_ID) {
      postMessage('get-definitions', force);
    } else {
      postMessage('get-dep-tree', force);
    }
  };

  chrome.devtools.panels.create(
    'Cubbles',
    'cubbles.png',
    'index.html',
    function (panel) {
      var initialised = false;
      panel.onShown.addListener(function (extPanelWin) {
        if (!initialised) {
          cubblesPanel = extPanelWin;
          componentVwr = extPanelWin.document.querySelector('cubx-generic-component-viewer');
          depTreeVwr = extPanelWin.document.querySelector('cubx-dep-tree-viewer');
          extPanelWin.document.addEventListener('cifReady', function () {
            var reloadB = extPanelWin.document.querySelector('#reloadB');
            reloadB.removeAttribute('disabled');
            reloadB.addEventListener('click', function () {
              requestInformation();
            });
            extPanelWin.addOnShownListener('componentViewerT', componentVwr, requestInformation);
            extPanelWin.addOnShownListener('depsTreeViewerT', depTreeVwr, requestInformation, true);
            requestInformation(true);
          });
        }
        initialised = true;
      });
    }
  );

  chrome.devtools.panels.elements.createSidebarPane('Cubbles',
    function (sidebar) {
      cubblesSidepanel = sidebar;
      sidebar.setPage('sidebar.html');

      sidebar.onShown.addListener(function (window) {
        cubblesSidepanel.window = window;
        updateSlotsInfo();
      });

      function updateSlotsInfo () {
        chrome.devtools.inspectedWindow.eval('window.setSelectedElement($0)',
          { useContentScriptContext: true });
      }

      chrome.devtools.panels.elements.onSelectionChanged.addListener(updateSlotsInfo);
    });

  function postMessage (name, content) {
    backgroundPageConnection.postMessage({
      name: name,
      content: content,
      tabId: chrome.devtools.inspectedWindow.tabId
    });
  }

  var backgroundPageConnection = chrome.runtime.connect({
    name: 'devtools-connection'
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
        requestInformation(true);
        break;
      case 'tab-updated':
        postExecuteContentScript();
        break;
      case 'set-slots-info':
        if (cubblesSidepanel.window) {
          cubblesSidepanel.window.setInputSlotsInfo(message.content);
        }
        break;
    }
  });
  postExecuteContentScript();
})();
