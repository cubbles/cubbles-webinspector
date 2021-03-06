(function () {
  var componentsDefs = {};
  var membersDefs = {};
  var connectionDefs = [];
  var connectionIds = [];
  var lastSentDefs;
  var rootCrcId = '';
  var lastSentSlotsInfo;
  var lastConfirmedUpdatedSlotInfo;

  
  document.addEventListener('cifReady', handleCifReady);

  document.addEventListener('getInfo', function (e) {
    if (cifIsReady()) {
        switch (e.detail.name) {
            case 'get-definitions':
                postDefinitions(e.detail.content);
                break;
            case 'get-dep-tree':
                postDepTree(e.detail.content);
                break;
            case 'get-slots-info':
                handleSlotsInfoRequest(e.detail.content);
                break;
            case 'get-slots-info-force':
                handleSlotsInfoRequest(e.detail.content, true);
                break;
            case 'slot-info-was-updated':
                lastConfirmedUpdatedSlotInfo = e.detail.content;
                break;
            case 'set-selected-cubble':
                window.$cubble = document.querySelector(`[runtime-id="${e.detail.content}"]`);
                break;
            case 'get-cubbles-list': 
                postCubblesList();
                break;
            case 'set-slot-value':
                setSlotValue(
                    document.querySelector(`[runtime-id="${e.detail.content.runtimeId}"]`),
                    e.detail.content.slotId,
                    e.detail.content.slotValue
                );
                break;
            case 'inspect-cubble':
              inspectCubble(e.detail.content);
              break;
            case 'de-inspect-cubble':
              deInspectCubble(e.detail.content);
              break;
        }
    }
  });

  if (cifIsReady()) {
    postInitialMessages();
  }

  function inspectCubble (options) {
    let cubble = document.querySelector(`[runtime-id="${options.runtimeId}"]`);
    let divHighlighter = document.getElementById('divHighlighter');
    let boundingRect = cubble.getBoundingClientRect();
    if (options.shouldScrollTo) {
      cubble.scrollIntoView({ block: 'center' });
    }
    if (options.shouldHighlight) {
      boundingRect = cubble.getBoundingClientRect();
      divHighlighter.style.left = `${boundingRect.left}px`;
      divHighlighter.style.top = `${boundingRect.top}px`;
      divHighlighter.style.width = `${boundingRect.width}px`;
      divHighlighter.style.height = `${boundingRect.height}px`;
      divHighlighter.style.display = 'block';
    }
  }

  function deInspectCubble () {
    let divHighlighter = document.getElementById('divHighlighter');
    divHighlighter.style.display = 'none';
  }

  function cifIsReady () {
    return window.cubx && window.cubx.cif &&
    ( window.cubx.cif._cifReady || (window.cubx.cif.cif && window.cubx.cif.cif._cifReady ));
  }

  function extractSlotInitInfo (cubble) {
    let coreInit = cubble.querySelector('cubx-core-init');
    let slotsInitInfo = new Map();
    if (coreInit) {
      let slotInits = coreInit.querySelectorAll('cubx-core-slot-init');
      slotInits.forEach(function(slotInit) {
        slotsInitInfo.set(slotInit.getAttribute('slot'), JSON.parse(slotInit.innerText));
      });
    }
    return slotsInitInfo;
  }

  function extractConnectionsInfo (cubble) {
    let coreConnections = cubble.querySelector('cubx-core-connections');
    let connectionsInfo = [];
    if (coreConnections) {
      let connections = coreConnections.querySelectorAll('cubx-core-connection');
      connections.forEach(function(connection) {
        let connectionInfo = {};
        connectionInfo.connectionId = connection.getAttribute('connection-id');
        connectionInfo.source = connection.getAttribute('source');
        connectionInfo.destination = connection.getAttribute('destination');
        connectionsInfo.push(connectionInfo);
      });
    }
    return connectionsInfo;
  }

  /**
   * Handle a request for the information of slots of a cubbles component
   * @param {string} runtimeId - RuntimeId of the component
   */
  function handleSlotsInfoRequest (runtimeId, force) {
    if (runtimeId === 'no-cubbles') {
      postMessage('set-slots-info', runtimeId);
      lastSentSlotsInfo = null;
    } else {
      var slotsInfo = getSlotsInfo(document.querySelector(`[runtime-id="${runtimeId}"]`));
      if (force || shouldSendSlotsInfo(slotsInfo)) {
        postMessage('set-slots-info', slotsInfo);
        lastSentSlotsInfo = slotsInfo;
      }
    }
  }

  function shouldSendSlotsInfo (slotsInfo) {
    return !lastSentSlotsInfo ||
    lastConfirmedUpdatedSlotInfo !== lastSentSlotsInfo.runtimeId ||
    !equalSlotsInfo(lastSentSlotsInfo, slotsInfo);
  }

  function equalSlotsInfo (slotsInfo1, slotsInfo2) {
    if (slotsInfo1.runtimeId !== slotsInfo2.runtimeId ||
    slotsInfo1.inputSlots.length !== slotsInfo2.inputSlots.length ||
    slotsInfo1.outputSlots.length !== slotsInfo2.outputSlots.length) {
      return false;
    }
    return equalSlotsLists(slotsInfo1.inputSlots, slotsInfo2.inputSlots) &&
      equalSlotsLists(slotsInfo1.outputSlots, slotsInfo2.outputSlots)
  }

  function equalSlotsLists(slotsList1, slotsList2) {
    for (var i = 0; i < slotsList1.length; i++) {
      var slotIndex = indexOfSlot(slotsList1[i].slotId, slotsList2);
      if (slotIndex > -1) {
        if (slotsList1[i].value !== slotsList2[slotIndex].value) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  function indexOfSlot (slotId, slotsList) {
    for (var i = 0; i < slotsList.length; i++) {
      if (slotsList[i].slotId === slotId) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Set the value of a cubbles component slot
   * @param {Object} cubbles - Cubbles whose slot is to be updated
   * @param {string} slotId - Id of the slot to be updated
   * @param {*} slotValue - Value to be set to the slot
   */
  function setSlotValue (cubbles, slotId, slotValue) {
    var setMethodName = 'set' + slotId.charAt(0).toUpperCase() + slotId.slice(1);
    if (cubbles && cubbles[setMethodName]) {
      cubbles[setMethodName](slotValue);
    }
  }

  /**
   * Extract the slots info of a Cubbles, to be presented in the cubbles-webinspector side panel
   */
  function getSlotsInfo (cubbles) {
    let inits = extractSlotInitInfo(cubbles);
    var slotsInfo = {
      inputSlots: [],
      outputSlots: [],
      runtimeId: cubbles.getAttribute('runtime-id'),
      memberId: cubbles.getAttribute('member-id'),
      artifactId: cubbles.tagName.toLowerCase()
    };

    if (cubbles.slots()) {
      cubbles.slots().forEach(function (slot) {
        addSlot(slot, 'input');
        addSlot(slot, 'output');
      });
  
      slotsInfo.inputSlots.sort(compareSlots);
      slotsInfo.outputSlots.sort(compareSlots);
    }

    function addSlot (slot, direction) {
      if (!slot.hasOwnProperty('direction') || slot.direction.length === 0 || slot.direction.indexOf(direction) !== -1) {
        slotsInfo[direction + 'Slots'].push(extractSlotInfo(slot, cubbles, direction));
      }
    }

    function extractSlotInfo (slot, cubbles, direction) {
      var slotInfo = {};
      slotInfo.slotId = slot.slotId;
      slotInfo.type = slot.type;
      slotInfo.value = cubbles.model[slot.slotId];
      slotInfo.description = slot.description;
      slotInfo.direction = direction;
      if (inits.has(slot.slotId)) {
        slotInfo.init = inits.get(slot.slotId);
      }
      return slotInfo;
    }

    function compareSlots(slotA, slotB) {
      if (slotA.slotId < slotB.slotId) {
        return -1;
      }
      if (slotA.slotId > slotB.slotId) {
        return 1;
      }

    }
    return slotsInfo;
  }

  /**
   * Post initial messages
   */
  function handleCifReady () {
    postInitialMessages();
  }

  function getCubbles () {
    return document.querySelectorAll('[runtime-id]');
  }

  /**
   * Post initial messages
   */
  function postInitialMessages () {
    postMessage('cif-ready');
    postDefinitions(true);
    postDepTree(true);
    postCubblesList();
  }

  /**
   * Post a message indicating the source. Message will be received by the content_script.js
   * @param name
   * @param content
   */
  function postMessage (name, content) {
    window.postMessage({ name: name, content: content, source: 'cubbles-webinspector' }, '*');
  }

  /**
   * Build de depTree and parse it to JSON. Then send the depTree as message
   * @param {boolean} force - Indicates whether the message should forced to be sent
   */
  function postDepTree (force) {
    var depMgr = window.cubx.CRC.getDependencyMgr();
    // Create list of DepReference items from given rootDependencies
    var deps = depMgr._createDepReferenceListFromArtifactDependencies(window.cubx.CRCInit.rootDependencies, null);

    // Finally build rawDependency tree providing DepReference list and baseUrl
    depMgr._buildRawDependencyTree(deps, window.cubx.CRC._baseUrl)
      .then(function (depTree) {
        if (force || _isNewRoot(window.cubx.CRC._crcElId)) {
          rootCrcId = window.cubx.CRC._crcElId;
          postMessage('set-dep-tree', depTreeToJSON(depTree));
          dependencyTree = depTree;
        }
      });
  }

  function postDefinitions (options) {
    // TODO: Use new dynamicConnectionEvent when available
    var defs = _getDefinitions();
    if (options || !lastSentDefs|| !_sameConnectionsIds(lastSentDefs, defs)) {
      lastSentDefs = defs;
      postMessage('set-definitions', defs);
    }
  }

  function postCubblesList () {
    var cubbles = getCubbles();
    var cubblesInfo = [];
    cubbles.forEach(function(cubble) {
      cubblesInfo.push(extractCubblesInfo(cubble));
    });
    postMessage('set-cubbles-list', cubblesInfo);
  }

  function extractCubblesInfo (cubble) {
    var cubblesInfo = {};
    cubblesInfo.id = cubble.getAttribute('runtime-id');
    cubblesInfo.text = extractTextOfCubble(cubble);
    cubblesInfo.children = [];
    cubble.querySelectorAll('[runtime-id]').forEach(function (cubbleChild) {
      cubblesInfo.children.push(extractCubblesInfo(cubbleChild));
    });
    return cubblesInfo;
  }

  function extractTextOfCubble (cubble) {
    let text = `<span class="tag-name">&lt;${cubble.tagName.toLowerCase()}</span>`;
    let attributes = [ 'id', 'cubx-webpackage-id', 'runtime-id', 'member-id' ];
    attributes.forEach(function(attribute) {
      if (cubble.getAttribute(attribute)) {
        text += ` <span class="attribute-name">${attribute}</span>=<span class="attribute-value">${cubble.getAttribute(attribute)}</span>`;
      }
    });
    text += '<span class="tag-name">&gt;</span>'
    return text;
  }

  /**
   * Parse a depTree to JSON format so that it can be post as message
   * @param {DependencyTree} depTree - Dependency tree to be parsed
   * @returns {{_rootNodes: Array}}
   */
  function depTreeToJSON (depTree) {
    var rootNodes = [];
    depTree._rootNodes.forEach(function (rootNode) {
      rootNodes.push(nodeToJSON(rootNode));
    });
    return { _rootNodes: rootNodes };
  }

  /**
   * Parse a node to JSON format, so that it can be post as message
   * @param {DependencyTree.Node} node - Node to be parsed
   * @returns {{data: object, children: Array}}
   */
  function nodeToJSON (node) {
    var jsonObject = {};
    var children = [];
    if (node.children.length > 0) {
      node.children.forEach(function (child) {
        children.push(nodeToJSON(child));
      });
    }
    jsonObject.data = {
      webpackageId: node.data.webpackageId,
      artifactId: node.data.artifactId,
      resources: node.data.resources
    };
    jsonObject.children = children;
    return jsonObject;
  }

  function _isNewRoot (newRootCrcId) {
    return newRootCrcId !== rootCrcId;
  }

  function _sameConnectionsIds (currentDefs, newDefs) {
    var currentConnectionIds = _extractConnectionIds(currentDefs) || [];
    var newConnectionIds = _extractConnectionIds(newDefs) || [];
    var length1 = currentConnectionIds.length;
    if (length1 !== newConnectionIds.length) {
      return false;
    }
    for (var i = 0; i < length1; i++) {
      if (newConnectionIds.indexOf(currentConnectionIds[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  function _extractConnectionIds (defs) {
    return defs.connections.map(function (connection) { return connection.connectionId; });
  }


  /**
   * Build an object containing a connection definition, based on a context connection object
   * @param {object} contextConnection - Root context connection object
   * @returns {{connectionId: *, copyValue: *, destination: {memberIdRef: *, slot: *}, source: {memberIdRef: *, slot: *}, hookFunction: *, repeatedValues: *}}
   * @private
   */
  function _getConnectionDefFromContextConnection (contextConnection) {
    return {
      connectionId: contextConnection.connectionId,
      copyValue: contextConnection.copyValue,
      destination: {
        memberIdRef: contextConnection.destination.memberId ||
        contextConnection.destination.component.getAttribute('member-id'),
        slot: contextConnection.destination.slot
      },
      source: {
        memberIdRef: contextConnection.source.memberId ||
        contextConnection.source.component.getAttribute('member-id'),
        slot: contextConnection.source.slot
      },
      hookFunction: contextConnection.hookFunction,
      repeatedValues: contextConnection.repeatedValues
    };
  }

  /**
   * While component definitions are built, slots definitions are stored as object in order to
   * avoid duplicate definitions. After all definitions are ready, these mebers shoudl be stored
   * as array.
   * @returns {Array} - Members' definitions as array
   * @private
   */
  function _membersDefsToArray () {
    var members = [];
    Object.keys(membersDefs).forEach(function (memberDefId) {
      members.push(membersDefs[memberDefId]);
    });
    return members;
  }

  /**
   * Extract the definitions of components, members and connections based on the information
   * provided in connections array (from root context)
   * @returns {{components: (componentsDefs|{}|*), members: *, connections: Array}}
   * @private
   */
  function _getDefinitions () {
    _fillComponentsDefinitions();
    _fillMembersDefinitions();
    _fillConnectionDefinitions();
    return { components: componentsDefs, members: _membersDefsToArray(), connections: connectionDefs };
  }

  function _fillConnectionDefinitions () {
    connectionDefs = [];
    _getRootConnections().forEach(function (connection) {
      var connectionDef = _getConnectionDefFromContextConnection(connection);
      if (connectionMembersAreDefined(connectionDef)) {
        connectionDefs.push(connectionDef);
        connectionIds.push(connectionDef.connectionId);
      }
    });
  }

  function connectionMembersAreDefined (connectionDef) {
    return membersDefs.hasOwnProperty(connectionDef.source.memberIdRef) &&
      membersDefs.hasOwnProperty(connectionDef.destination.memberIdRef)
  }

  function _fillMembersDefinitions () {
    membersDefs = {};
    _getContextComponents().forEach(function (component) {
      var memberId = _getMemberIdFromComponentElement(component);
      var artifactId = _getArtifactIdFromComponentElement(component);
      if (!membersDefs.hasOwnProperty(memberId) && componentsDefs.hasOwnProperty(artifactId)) {
        membersDefs[memberId] = {
          memberId: memberId,
          artifactId: artifactId
        };
      }
    })

  }

  function _fillComponentsDefinitions () {
    componentsDefs = {};
    _getContextComponents().forEach(function (component) {
      var artifactId = _getArtifactIdFromComponentElement(component);
      if (!componentsDefs.hasOwnProperty(artifactId) && !_isChildOfAnElementary(component)) {
        componentsDefs[artifactId] = window.cubx.CRC._cache._componentCache[artifactId];
      }
    })
  }

  function _isChildOfAnElementary (component) {
    var parentElement = component.parentElement;
    if (_getRootComponent() === parentElement) {
      return false;
    } else if (parentElement.hasAttribute('member-id')) {
      return true;
    }
    else {
      return _isChildOfAnElementary(parentElement);
    }
  }

  function _getRootComponent () {
    return window.cubx.CRC._root.Context._rootElement;
  }

  function _getContextComponents () {
    return window.cubx.CRC._root.Context._components;
  }

  function _getRootConnections () {
    return window.cubx.CRC._root.Context._connectionMgr._connections;
  }

  function _getArtifactIdFromComponentElement (componentElement) {
    return componentElement.tagName.toLowerCase();
  }

  function _getMemberIdFromComponentElement (componentElement) {
    return componentElement.getAttribute('member-id');
  }

  function injectDivHighlighter() {
    let divHighlighter = document.createElement('div');
    divHighlighter.setAttribute('id', 'divHighlighter');
    divHighlighter.style.display = 'none';
    divHighlighter.style.position = 'fixed';
    divHighlighter.style.zIndex = '10';
    divHighlighter.style.backgroundColor ='#2196f345';
    document.body.appendChild(divHighlighter);
  }

  injectDivHighlighter();
})();
