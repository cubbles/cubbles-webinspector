(function () {
  var componentsDefs = {};
  var membersDefs = {};
  var slotsDefs = {};
  var connectionDefs = [];
  var connectionIds = [];
  var dependencyTree;

  document.addEventListener('getInfo', function (e) {
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
      case 'set-slot-value':
        setSlotValue(
          document.querySelector('[runtime-id="' + e.detail.content.runtimeId + '"]'),
          e.detail.content.slotId,
          e.detail.content.slotValue
        );
        break;
    }
  });

  if (window.cubx && window.cubx.cif && window.cubx.cif.cif && window.cubx.cif.cif._cifReady) {
    postInitialMessages();
  } else {
    document.addEventListener('cifReady', handleCifReady);
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
      addSlot(slot, 'input', slotsInfo.inputSlots);
      addSlot(slot, 'output', slotsInfo.outputSlots);
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
    var deps = depMgr._createDepReferenceListFromArtifactDependencies(window.cubx.CRCInit.rootDependencies);

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
    var defs = _getDefsFromConnections(window.cubx.CRC._root.Context._connectionMgr._connections);
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
   * Add or update a component definition to 'componentsDefs' object
   * @param {object} connectionComponent - Source or destination object of a context connection
   * @param isSource - Boolean indicating whether the slot is the source of a connection
   * @private
   */
  function _addComponentDefFromContextConnection (connectionComponent, isSource) {
    var artifactId = connectionComponent.component.tagName.toLowerCase();
    var runtimeId = connectionComponent.component.getAttribute('runtime-id');
    var webpackageId = runtimeId.slice(0, runtimeId.indexOf('/'));
    var slotDefId = _generateSlotDefId(connectionComponent, artifactId);
    if (!componentsDefs.hasOwnProperty(artifactId)) {
      componentsDefs[artifactId] = {
        artifactId: artifactId,
        slots: [ slotDefId ],
        webpackageId: webpackageId
      };
    } else {
      if (componentsDefs[artifactId].slots.indexOf(slotDefId) === -1) {
        componentsDefs[artifactId].slots.push(slotDefId);
      }
    }
    var memberId = connectionComponent.memberId ||
      connectionComponent.component.getAttribute('member-id');
    if (!membersDefs.hasOwnProperty(memberId)) {
      membersDefs[memberId] = {
        memberId: memberId,
        artifactId: artifactId
      };
    }
    _updateSlotDef(slotDefId, connectionComponent.slot, isSource);
  }

  /**
   * If the slotDef is not stored, then add it to 'slotsDefs', otherwise, check if it should
   * be updated.
   * @param {string} slotDefId - Generated slotId to identify al slot definition
   * @param {string} slotId - Slot name or id
   * @param {boolean} isSource - Boolean indicating whether the slot is the source of a connection
   * @private
   */
  function _updateSlotDef (slotDefId, slotId, isSource) {
    var direction = isSource ? 'output' : 'input';
    if (!slotsDefs.hasOwnProperty(slotDefId)) {
      slotsDefs[slotDefId] = { slotId: slotId, direction: [direction] };
    } else if (slotsDefs[slotDefId].direction.indexOf(direction) === -1) {
      slotsDefs[slotDefId].direction.push(direction);
    }
  }

  /**
   * Generate a slot id to identify slots definitions
   * @param {object} connectionComponent - Source or destination object of a context connection
   * @param {string} artifactId - Artifact id of the component containing the slot
   * @returns {string} slotId
   * @private
   */
  function _generateSlotDefId (connectionComponent, artifactId) {
    return connectionComponent.slot + '#' + artifactId;
  }

  /**
   * While definitions are built, the members of a component are stored as string, using a slot
   * definition key, after all definitions are ready, those ids should be replaced by the actual
   * slots definitions.
   * @private
   */
  function _completeComponentSlotDefs () {
    Object.keys(componentsDefs).forEach(function (arifactId) {
      componentsDefs[arifactId].slots = componentsDefs[arifactId].slots.map(function (slotDefId) {
        return slotsDefs[slotDefId];
      });
    });
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
   * @param {Array} connections - Array containing root context connections
   * @returns {{components: (componentsDefs|{}|*), members: *, connections: Array}}
   * @private
   */
  function _getDefsFromConnections (connections) {
    connections.forEach(function (connection) {
      _addComponentDefFromContextConnection(connection.source, true);
      _addComponentDefFromContextConnection(connection.destination);
      var connectionDef = _getConnectionDefFromContextConnection(connection);
      connectionDefs.push(connectionDef);
      connectionIds.push(connectionDef.connectionId);
    });

    _completeComponentSlotDefs();
    return { components: componentsDefs, members: _membersDefsToArray(), connections: connectionDefs };
  }
})();
