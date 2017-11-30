/* globals chrome */
(function () {
  var CONNECTION_VWR_TAB_ID = 'componentViewerT';
  var cubblesPanelWindow;
  var cubblesSidepanelWindow;
  var componentVwr;
  var depTreeVwr;
  var backgroundPageConnection;
  var shouldRequestDepTree;
  var selectedComponent;

  /**
   * Post a message to request the execution of the contentScript
   */
  function postExecuteContentScript () {
    // Relay the tab ID to the background page
    shouldRequestDepTree = true;
    backgroundPageConnection.postMessage({
      name: 'execute-script',
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptToInject: 'lib/content_script.js'
    });
  }

  /**
   * Post a message requesting the root connections definitions or the root dependencies depending
   * on the shown tab
   * @param {boolean} force - indicates whether the request should force the injected script to send
   * the information
   */
  function requestInformation (force) {
    if (cifIsReadyInCubblesPanel() && !componentVwrIsWorking()) {
      var activeTab = cubblesPanelWindow.document.querySelector('ul.nav-tabs li.active a');
      if (activeTab.id === CONNECTION_VWR_TAB_ID) {
        adjustDataflowHeight();
        postMessage('get-definitions', force);
      } else if (shouldRequestDepTree) {
        postMessage('get-dep-tree', force);
        shouldRequestDepTree = false;
      }
    }
  }

  function componentVwrIsWorking () {
    return componentVwr.getStatus() === 'working';
  }

  function cifIsReadyInCubblesPanel () {
    return cubblesPanelWindow.cubx &&
      cubblesPanelWindow.cubx.cif &&
      cubblesPanelWindow.cubx.cif.cif &&
      cubblesPanelWindow.cubx.cif.cif._cifReady;
  }

  /**
   * Adjust the height of the dataflow view
   */
  function adjustDataflowHeight () {
    var newHeight = calculateFullScreenHeight();
    if (newHeight !== componentVwr.getViewerHeight()) {
      componentVwr.setViewerHeight(newHeight);
      componentVwr.setScale('auto');
    }
  }

  function calculateFullScreenHeight () {
    var screenHeight = componentVwr.ownerDocument.defaultView.innerHeight * 0.8;
    var finalHeight = screenHeight - screenHeight * componentVwr.MINIMAP_SCALE;
    return finalHeight + 'px';
  }

  /**
   * Post a message to the background script
   * @param {string} name - Name which identifies the message
   * @param {*} content - Message to be sent
   */
  function postMessage (name, content) {
    backgroundPageConnection.postMessage({
      name: name,
      content: content,
      tabId: chrome.devtools.inspectedWindow.tabId
    });
  }

  /**
   * Initialise a connection to eh background script
   */
  function initBackgroundConnection () {
    backgroundPageConnection = chrome.runtime.connect({
      name: 'devtools-connection'
    });
    backgroundPageConnection.onMessage.addListener(function (message) {
      if (message && message.hasOwnProperty('name')) {
        switch (message.name) {
          case 'set-definitions':
            if (cubblesPanelWindow) {
              console.log('definitions: ', message.content);
              componentVwr.setDefinitions(message.content);
            }
            break;
          case 'set-dep-tree':
            if (cubblesPanelWindow) {
              depTreeVwr.setDepTree(message.content);
            }
            break;
          case 'cif-ready':
            if (cubblesPanelWindow) {
              requestInformation(true);
            }
            break;
          case 'tab-updated':
            postExecuteContentScript();
            break;
          case 'set-slots-info':
            if (cubblesSidepanelWindow.window) {
              cubblesSidepanelWindow.window.setInputSlotsInfo(message.content);
            }
            break;
          case 'set-selected-component':
            selectedComponent = message.content;
            if (componentVwr) {
              componentVwr.setHighlightedMember(selectedComponent);
            }
            break;
        }
      }
    });
  }

  /**
   * Create the cubbles web inspector tab, and the Cubbles sidebar within the elements tab
   */
  function createCubblesInspectorPanels () {
    chrome.devtools.panels.create(
      'Cubbles',
      'cubbles.png',
      'index.html',
      function (panel) {
        panel.onShown.addListener(function (extPanelWin) {
          cubblesPanelWindow = extPanelWin;
          componentVwr = extPanelWin.document.querySelector('cubx-generic-component-viewer');
          depTreeVwr = extPanelWin.document.querySelector('cubx-dep-tree-viewer');
          extPanelWin.document.addEventListener('cifReady', function () {
            setInterval(requestInformation, 500);
            extPanelWin.addOnShownListener('componentViewerT', componentVwr);
            extPanelWin.addOnShownListener('depsTreeViewerT', depTreeVwr, true);
            requestInformation(true);
            componentVwr.setHighlightedMember(selectedComponent);
          });
        });
      });
    chrome.devtools.panels.elements.createSidebarPane('Cubbles',
      function (sidebar) {
        cubblesSidepanelWindow = sidebar;
        sidebar.setPage('sidebar.html');

        sidebar.onShown.addListener(function (window) {
          cubblesSidepanelWindow.window = window;
          window.postMessageToBackgroundScript = function (name, content) {
            postMessage(name, content);
          };
          updateSelectedComponet();
          setInterval(updateSidebarSlotsInfo, 500);
        });

        function updateSelectedComponet () {
          chrome.devtools.inspectedWindow.eval('window.setSelectedElement($0)',
            { useContentScriptContext: true });
        }

        function updateSidebarSlotsInfo () {
          chrome.devtools.inspectedWindow.eval('window.getSlotsInfo($0)',
            { useContentScriptContext: true });
        }

        chrome.devtools.panels.elements.onSelectionChanged.addListener(updateSelectedComponet);
      });
  }

  initBackgroundConnection();
  createCubblesInspectorPanels();
  postExecuteContentScript();
})();
