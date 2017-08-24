(function () {
  var componentsDefs = {};
  var membersDefs = {};
  var slotsDefs = {};
  var connectionDefs = [];
  var defsReady;
  var rootDepsReady;
  var baseUrlReady;

  if (window.cubx && window.cubx.CRC && window.cubx.CRC._root.Context &&
    window.cubx.CRC._root.Context._connectionMgr &&
    window.cubx.CRC._root.Context._connectionMgr._connections) {
    postDefinitions();
    defsReady = true;
  }
  if (window.cubx && window.cubx.CRCInit && window.cubx.CRCInit.rootDependencies) {
    postRootDeps();
    rootDepsReady = true;
  }
  if (window.cubx && window.cubx.CRC && window.cubx.CRC._baseUrl) {
    postBaseUrl();
    baseUrlReady = true;
  }
  if (!defsReady || !rootDepsReady || !baseUrlReady) {
    document.addEventListener('cifReady', function () {
      if (!defsReady) {
        postDefinitions();
      }
      if (!rootDepsReady) {
        postRootDeps();
      }
      if (!baseUrlReady) {
        postBaseUrl();
      }
    });
  }

  function postMessage (name, content) {
    window.postMessage({ name: name, content: content, source: 'cubbles-webinspector' }, '*');
  }

  function postRootDeps () {
    postMessage('set-root-deps', window.cubx.CRCInit.rootDependencies);
  }

  function postBaseUrl () {
    var a = document.createElement('a');
    a.href = window.cubx.CRC._baseUrl;
    postMessage('set-base-url', a.href);
  }

  /**
   * Post the definitions of the current page
   */
  function postDefinitions () {
    componentsDefs = {};
    membersDefs = {};
    slotsDefs = {};
    connectionDefs = [];
    postMessage('set-definitions', _getDefsFromConnections(window.cubx.CRC._root.Context._connectionMgr._connections));
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
      connectionDefs.push(_getConnectionDefFromContextConnection(connection));
    });

    _completeComponentSlotDefs();
    return { components: componentsDefs, members: _membersDefsToArray(), connections: connectionDefs };
  }
})();
