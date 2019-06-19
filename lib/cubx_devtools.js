/* globals chrome */
(function () {
  var CONNECTION_VWR_TAB_ID = 'componentViewerT';
  var DEP_TREE_VWR_TAB_ID = 'depsTreeViewerT';
  var cubblesPanelWindow;
  var cubblesSidepanel;
  var componentVwr;
  var depTreeVwr;
  var backgroundPageConnection;
  var shouldRequestDepTree;
  var selectedComponentMemberId;
  var counter=0;
  var firstTimeCubblesPanel = true;
  var firstTimeCubblesSidebar = true;
  var cubblesPanelIsVisible = false;
  var cubblesSidebarIsVisible = false;
  var cubblesSelected = false;

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
  function requestPanelInformation (force) {
    if (cifIsReadyInCubblesPanel()) {
      var activeTab = cubblesPanelWindow.document.querySelector('ul.nav-tabs li.active a');
      if (activeTab.id === CONNECTION_VWR_TAB_ID && !componentVwrIsWorking()) {
        adjustDataflowHeight();
        var currentDefs = componentVwr.getDefinitions();
        postMessage('get-definitions', force || false);
      } else if (activeTab.id === DEP_TREE_VWR_TAB_ID && shouldRequestDepTree) {
        postMessage('get-dep-tree', force);
        adjustDepTreeView();
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

  function adjustDepTreeView() {
    depTreeVwr.setHeight(calculateFullScreenHeight());
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
            if (cubblesPanelWindow && !componentVwrIsWorking()) {
              componentVwr.setDefinitions(message.content);
            }
            break;
          case 'set-dep-tree':
            if (cubblesPanelWindow) {
              depTreeVwr.setDepTree(message.content);
              cubblesPanelWindow.handleDepTreesAutoScale(depTreeVwr);
            }
            break;
          case 'cif-ready':
            if (cubblesPanelWindow) {
              requestPanelInformation(true);
            }
            break;
          case 'cif-model-change':
            if (cubblesPanelWindow) {
              cubblesPanelWindow.updateSidebarSlotsInfo(message.content);
            }
            break;
          case 'tab-updated':
            postExecuteContentScript();
            break;
          case 'set-slots-info':
            if (cubblesPanelWindow) {
              cubblesPanelWindow.setInputSlotsInfo(message.content);
            }
            break;
          case 'set-tag-init-info':
            if (cubblesPanelWindow) {
              cubblesPanelWindow.setTagInitInfo(message.content);
            }
            break;
          case 'set-cubbles-list':
            if (cubblesPanelWindow) {
              cubblesPanelWindow.setCubblesList(message.content);
            }
            break;
          case 'set-selected-component':
            selectedComponentMemberId = message.content;
            cubblesSelected = message.content !== 'no-cubbles';
            if (componentVwr && cubblesSelected) {
              componentVwr.setHighlightedMember(selectedComponentMemberId);
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
          if (firstTimeCubblesPanel) {
            cubblesPanelWindow = extPanelWin;
            componentVwr = extPanelWin.document.querySelector('cubx-generic-component-viewer');
            depTreeVwr = extPanelWin.document.querySelector('cubx-dep-tree-viewer');
            extPanelWin.document.addEventListener('cifReady', function () {
              extPanelWin.addOnShownListener('componentViewerT', componentVwr, true, function() {
                postMessage('get-definitions', true)
              });
              extPanelWin.addOnShownListener('depsTreeViewerT', depTreeVwr, true, function () {
                postMessage('get-dep-tree', true)
              });
              requestPanelInformation(true);
              componentVwr.setHighlightedMember(selectedComponentMemberId);
            });
            extPanelWin.postMessageToBackgroundScript = function (name, content) {
              postMessage(name, content);
            };
            updateSelectedComponent();
            postMessage('get-cubbles-list');
            firstTimeCubblesPanel = false;
          }
          cubblesPanelIsVisible = true;
        });
        panel.onHidden.addListener(function () {
          cubblesPanelIsVisible = false;
        });
        chrome.devtools.panels.elements.onSelectionChanged.addListener(updateSelectedComponent);
      });

    function updateSelectedComponent () {
      chrome.devtools.inspectedWindow.eval('window.setSelectedElement($0.getAttribute("runtime-id"))',
        { useContentScriptContext: true });
      if (cubblesPanelIsVisible) {
        updateSidebarSlotsInfo();
      }
    }

    function updateSidebarSlotsInfo () {
      chrome.devtools.inspectedWindow.eval('window.getSlotsInfo($0.getAttribute("runtime-id"))',
        { useContentScriptContext: true });
    }

    setInterval(function () {
      if (cubblesPanelIsVisible) {
        requestPanelInformation(false);
      }
    }, 500)
  }

  initBackgroundConnection();
  createCubblesInspectorPanels();
  postExecuteContentScript();
})();
