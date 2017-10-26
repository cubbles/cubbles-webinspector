(function () {
  var componentsDefs = {};
  var membersDefs = {};
  var slotsDefs = {};
  var connectionDefs = [];
  var connectionIds = [];
  var dependencyTree;

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
            case 'get-selected-component':
                if (e.detail.content) {
                    postMessage('set-selected-component', e.detail.content);
                }
                break;
            case 'set-slot-value':
                setSlotValue(
                    document.querySelector('[runtime-id="' + e.detail.content.runtimeId + '"]'),
                    e.detail.content.slotId,
                    e.detail.content.slotValue
                );
                break;
        }
    }
  });

  if (cifIsReady()) {
    postInitialMessages();
  } else {
    document.addEventListener('cifReady', handleCifReady);
  }

  function cifIsReady () {
    return window.cubx && window.cubx.cif && window.cubx.cif.cif && window.cubx.cif.cif._cifReady;
  }

  /**
   * Handle a request for the information of slots of a cubbles component
   * @param {string} runtimeId - RuntimeId of the component
   */
  function handleSlotsInfoRequest (runtimeId) {
    var message = {};
    if (runtimeId) {
      message = getSlotsInfo(document.querySelector('[runtime-id="' + runtimeId + '"]'));
    }
    postMessage('set-slots-info', message);
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
   * @param cubbles
   * @returns {{inputSlots: {}, outputSlots: {}}}
   */
  function getSlotsInfo (cubbles) {
    var slotsInfo = { inputSlots: [], outputSlots: [], runtimeId: cubbles.getAttribute('runtime-id') };
    cubbles.slots().forEach(function (slot) {
      addSlot(slot, 'input');
      addSlot(slot, 'output');
    });

    function addSlot (slot, direction) {
      if (slot.direction.indexOf(direction) !== -1) {
        slotsInfo[direction + 'Slots'].push(extractSlotInfo(slot, cubbles));
      }
    }

    function extractSlotInfo (slot, cubbles) {
      var slotInfo = {};
      slotInfo.slotId = slot.slotId;
      slotInfo.type = slot.type;
      slotInfo.value = cubbles.model[slot.slotId];
      slotInfo.description = slot.description;
      return slotInfo;
    }
    return slotsInfo;
  }

  /**
   * Post initial messages and removes 'cifReady' event listener
   */
  function handleCifReady () {
    postInitialMessages();
    document.removeEventListener('cifReady', handleCifReady);
  }

  /**
   * Post initial messages and removes 'cifReady' event listener
   */
  function postInitialMessages () {
    postMessage('cif-ready');
    postDefinitions(true);
    postDepTree(true);
    document.removeEventListener('cifReady', postInitialMessages);
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
        if (force || depTree !== dependencyTree) {
          postMessage('set-dep-tree', depTreeToJSON(depTree));
          dependencyTree = depTree;
        }
      });
  }

  /**
   * Post the definitions of the current page
   * * @param {boolean} force - Indicates whether the message should forced to be sent
   */
  function postDefinitions (force) {
    // TODO: Use new dynamicConnectionEvent when available
    var oldConnectionIds = connectionIds;
    componentsDefs = {};
    membersDefs = {};
    slotsDefs = {};
    connectionDefs = [];
    connectionIds = [];
    var defs = _getDefinitions();
    if (force || !_sameConnectionsIds(oldConnectionIds, connectionIds)) {
      postMessage('set-definitions', defs);
    }
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

  /**
   * Indicates whether two arrays of connections Id contains the same connections ids
   * @param {Array} connIds1 - Array to be compared
   * @param {Array} connIds2 - Array to be compared
   * @returns {boolean}
   */
  function _sameConnectionsIds (connIds1, connIds2) {
    var length1 = connIds1.length;
    if (length1 !== connIds2.length) {
      return false;
    }
    for (var i = 0; i < length1; i++) {
      if (connIds2.indexOf(connIds1[i]) === -1) {
        return false;
      }
    }
    return true;
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
    _getRootConnections().forEach(function (connection) {
      var connectionDef = _getConnectionDefFromContextConnection(connection);
      connectionDefs.push(connectionDef);
      connectionIds.push(connectionDef.connectionId);
    });
  }

  function _fillMembersDefinitions () {
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
})();
