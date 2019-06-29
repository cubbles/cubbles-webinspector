/* globals hljs, chrome */
(function () {
  var cubblesInfo = {};
  var runtimeId;
  const COL_CLASSES = [
    'col-lg-12 col-md-12 col-sm-12 col-xs-12',
    'col-lg-12 col-md-12 col-sm-12 col-xs-12'
  ];
  const SLOTS_TABLE_DATA = {
    input: {
      title: 'Input slots',
      tableId: 'inputSlotsTable',
      containerId: 'inputSlotsTableContainer',
      noSlotsMessage: 'The selected Cubble has no input slots'
    },
    output: {
      title: 'Output slots',
      tableId: 'outputSlotsTable',
      containerId: 'outputSlotsTableContainer',
      noSlotsMessage: 'The selected Cubble has no output slots'
    }
  };

  function initCubblesInfo (slotsInfo) {
    let cubbleInfo = {};
    cubbleInfo.artifactId = slotsInfo.artifactId;
    let slotsKeys = ['inputSlots', 'outputSlots'];
    slotsKeys.forEach(function (key) {
      cubbleInfo[key] = {};
      slotsInfo[key].forEach(function (slot) {
        cubbleInfo[key][slot.slotId] = slot;
        cubbleInfo[key][slot.slotId].firstValue = slot.value;
      });
    });
    cubblesInfo[slotsInfo.runtimeId] = cubbleInfo;
  }

  function updateSidebar (slotsInfo) {
    if (slotsInfo.runtimeId !== runtimeId) {
      runtimeId = slotsInfo.runtimeId;
      fillSlotsTables(slotsInfo);
    } else {
      updateSlotsValues(slotsInfo);
    }
  }

  /**
   * Method to update slots information of a cubbles within the sidebar panel
   * @param slotsInfo - {inputSlots: ..., outputSlots: ...}
   */
  window.setInputSlotsInfo = function (slotsInfo) {
    if (!cubblesInfo.hasOwnProperty(slotsInfo.runtimeId)) {
      initCubblesInfo(slotsInfo);
    }
    if (slotsInfo.inputSlots && slotsInfo.outputSlots) {
      updateSidebar(slotsInfo);
    }
  };

  window.setTagInitInfo = function (tagInitInfo) {
    let infos = [
      { containerId: 'coreInitsContainer', dataKey: 'slotInits' },
      { containerId: 'coreConnectionsContainer', dataKey: 'connectionsInfo' },
    ]
    infos.forEach(function(info) {
      let container = this.document.getElementById(info.containerId);
      let codeContainer = container.querySelector('.code-container');
      let emptyMessage = container.querySelector('.empty-message');
      if (tagInitInfo.hasOwnProperty(info.dataKey) && tagInitInfo[info.dataKey].length > 0) {
        let preCode = container.querySelector('pre');
        setJsonToSlotValueElement(preCode, tagInitInfo[info.dataKey]);
        showElement(codeContainer);
        hideElement(emptyMessage);
      } else {
        hideElement(codeContainer);
        showElement(emptyMessage);
      }
    });
  }

  window.setCubblesList = function (cubbles) {
    setCubblesToTree(cubbles);
  }

  function fillSlotsTables(slotsInfo) {
    let infos = [
      { slotInfoKey: 'inputSlots', metadataKey: 'input' },
      { slotInfoKey: 'outputSlots', metadataKey: 'output' }
    ]

    infos.forEach(function(info, i) {
      let tableContainer = document.getElementById(SLOTS_TABLE_DATA[info.metadataKey].containerId);
      showElement(tableContainer);
      let table = document.getElementById(SLOTS_TABLE_DATA[info.metadataKey].tableId);
      if (slotsInfo.hasOwnProperty(info.slotInfoKey) && slotsInfo[info.slotInfoKey].length > 0 ) {
        hideElement(tableContainer.querySelector('.no-slots-message'));
        showElement(table);
        createSlotsInfoElementsInTables(
          slotsInfo[info.slotInfoKey],
          table
        );
      } else {
        showElement(tableContainer.querySelector('.no-slots-message'));
        hideElement(table);
      }
    });
  }

  function requestSlotsInfo (targetRuntimeId) {
    targetRuntimeId = targetRuntimeId || runtimeId;
    chrome.devtools.inspectedWindow.eval(`window.getSlotsInfo('${targetRuntimeId}')`,
      { useContentScriptContext: true });
  }

  function updateSidebarTitle (slotsInfo) {
    document.querySelector('#sidebarTitle').innerHTML = '&lt;' + slotsInfo.artifactId + '&gt;';
  }

  function setSlotInfoInCubblesInfo (slotInfo, property, value, targetRuntimeId) {
    let key = slotInfo.direction === 'input' ? 'inputSlots': 'outputSlots';
    cubblesInfo[targetRuntimeId || runtimeId][key][slotInfo.slotId][property] = value;
  }

  function getSlotInfoInCubblesInfo (slotInfo, property, targetRuntimeId) {
    let key = slotInfo.direction === 'input' ? 'inputSlots': 'outputSlots';
    return cubblesInfo[targetRuntimeId || runtimeId][key][slotInfo.slotId][property];
  }

  function updateSlotsValues (slotsInfo) {
    let keys = ['inputSlots', 'outputSlots'];

    keys.forEach(function(key) {
      slotsInfo[key].forEach(function(slotInfo) {
        updateSlotValueElement(slotInfo);
        setSlotInfoInCubblesInfo(slotInfo, 'value', slotInfo.value);
      });
    });
  }

  function updateSlotValueElement (slotInfo, value) {
    var selector = `[data-slot-id="${slotInfo.slotId}"][data-slot-direction="${slotInfo.direction}"]`;
    var inputElement = document.querySelector(`.set-slot-input${selector}`);
    value = value || slotInfo.value;
    if (inputElement.tagName === 'TEXTAREA') {
      if (slotInfo.type !== 'string') {
        value = JSON.stringify(value, null, ' ');
      }
      inputElement.nextElementSibling.CodeMirror.doc.setValue(value);
    } else if (slotInfo.type === 'boolean') {
      updateCheckbox(inputElement, value);
    } else {
      inputElement.value = value;
    }
  }

  function updateCheckbox(element, value) {
    element.checked = value;
  }

  function setJsonToSlotValueElement (element, codeValue, options) {
    options = options || {withQuotes: true};
    var codeText = JSON.stringify(codeValue, null, '  ');
    element.setAttribute('data-slot-value', typeof codeValue === 'string'? codeValue : codeText);
    $(element).jsonViewer(codeValue, options);
  }

  /**
   * Append tables where information will be displayed
   */
  function appendHtmlElements () {
    var tablesContainer = document.querySelector('#slotsInfo');
    appendSlotTables(tablesContainer);
  }

  function appendSidebarTitle (container) {
    var sidebarTitle = document.createElement('h1');
    sidebarTitle.setAttribute('id', 'sidebarTitle');
    container.appendChild(sidebarTitle);
  }

  function appendSlotTables(tablesContainer) {
    tablesContainer.appendChild(generateSlotsTable(SLOTS_TABLE_DATA.input));
    tablesContainer.appendChild(generateSlotsTable(SLOTS_TABLE_DATA.output));
  }

  function generateSlotsTable(tableMetadata) {
    var tableContainer = document.createElement('div');
    tableContainer.setAttribute('id', tableMetadata.containerId);
    tableContainer.className = 'hidden';

    var tableTitle = document.createElement('h2');
    tableTitle.innerHTML = tableMetadata.title;
    tableContainer.appendChild(tableTitle);

    var noSlotsMessage = document.createElement('span');
    noSlotsMessage.innerText = tableMetadata.noSlotsMessage;
    noSlotsMessage.className = 'hidden text-muted no-slots-message';
    tableContainer.appendChild(noSlotsMessage);
 
    tableContainer.appendChild(generateTableElement(null, COL_CLASSES, tableMetadata.tableId));
    return tableContainer;
  }

  function generateTableElement (headers, colClasses, id) {
    var table = document.createElement('div');
    if (headers) {
      var headerDiv = document.createElement('div');
      headerDiv.className = 'head row row-no-gutters';

      headers.forEach(function (headerText, i) {
        let header = document.createElement('div');
        header.className = colClasses[i];
        header.innerHTML = `<strong>${headerText}</strong>`;
        headerDiv.appendChild(header);
      });
      table.appendChild(headerDiv);
    }
    
    if (id) {
      table.setAttribute('id', id);
    }

    var bodyDiv = document.createElement('div');
    bodyDiv.className = 'body';

    table.appendChild(bodyDiv);
    return table;
  }

  /**
   * Update the table that contains the slots info of the selected component (if any)
   * @param {Array} slots
   * @param {Element} table
   */
  function createSlotsInfoElementsInTables (slots, table) {
    clearTableBody(table);
    if (slots) {
      slots.forEach(function (slot) {
        createSlotInfoRow(slot, table);
      });
    }

    function clearTableBody (table) {
      table.querySelector('.body').innerHTML = '';
    }

    function createSlotInfoRow (slotInfo, table) {
      var row = document.createElement('div');
      row.className = 'row row-no-gutters';
      const ids = ['slotId', 'slotValue'];
      ids.forEach(function (id, i) {
        let container = document.createElement('div');
        container.className = COL_CLASSES[i];
        container.appendChild(createElementForCell(id, slotInfo));
        row.appendChild(container);
      });
      table.querySelector('.body').appendChild(row);

    }

    function usesCodeEditor (type) {
      return type !== 'boolean' && type !== 'number';
    }

    function createElementForSlotId (slotInfo) {
      var container = document.createElement('div');
      var slotInfoDiv = document.createElement('div');
      slotInfoDiv.classList.add('collapse-header');
      slotInfoDiv.classList.add('collapsed');
      slotInfoDiv.setAttribute('data-toggle', 'collapse');
      slotInfoDiv.setAttribute('data-target', `#${generateIdForSlotValueContainer(slotInfo)}`);
      
      var slotIdElement = document.createElement('strong');
      slotIdElement.innerHTML = slotInfo.slotId;
      var typeElement = document.createElement('small');
      typeElement.innerHTML = ` [${slotInfo.type}] `;
      slotInfoDiv.appendChild(slotIdElement);
      slotInfoDiv.appendChild(typeElement);
      
      var tooltip = generateDescriptionTooltip(slotInfo);
      if (tooltip) {
        slotInfoDiv.appendChild(tooltip);
      }
      container.appendChild(slotInfoDiv);
      container.classList.add('slot-id-container');
      return container;
    }

    function createElementForSlotValue (slotInfo) {
      var container = document.createElement('div');
      container.classList.add('collapse');
      container.classList.add('slot-value-container');
      container.setAttribute('data-slot-id', slotInfo.slotId);
      container.setAttribute('id', generateIdForSlotValueContainer(slotInfo));
      container.appendChild(createElementForSlotInitValue(slotInfo));
      container.appendChild(createElementForSetValue(slotInfo));

      if (usesCodeEditor(slotInfo.type)){
        $(container).on('shown.bs.collapse', function () {
          container.querySelector('.CodeMirror').CodeMirror.refresh();
        })
      }

      return container;
    }

    function generateIdForSlotValueContainer(slotInfo) {
      return `${slotInfo.slotId}ValueContainer_${slotInfo.direction}`;
    }

    function generateIdForInitSlotValueContainer(slotInfo) {
      return `${slotInfo.slotId}InitValueContainer_${slotInfo.direction}`;
    }

    function createElementForSlotInitValue (slotInfo) {
      var container = document.createElement('div');
      container.classList.add('collapse-header');
      container.classList.add('collapsed');
      container.setAttribute('data-toggle', 'collapse');
      container.setAttribute('data-target', `#${generateIdForInitSlotValueContainer(slotInfo)}`);

      var label = document.createElement('label');
      label.innerText = 'Initial value'

      var initElement;
      if (slotInfo.hasOwnProperty('init')) {
        initElement = document.createElement('pre');
        setJsonToSlotValueElement(initElement, slotInfo.init);
      } else {
        initElement = document.createElement('span');
        initElement.classList.add('text-muted');
        initElement.innerText = 'None';
      }
      initElement.classList.add('slot-init-value-element');      
      initElement.setAttribute('data-slot-id', slotInfo.slotId);
      initElement.setAttribute('data-slot-direction', slotInfo.direction);
      initElement.setAttribute('id', generateIdForInitSlotValueContainer(slotInfo));
      initElement.classList.add('collapse');

      container.appendChild(label);
      container.appendChild(initElement);
      return container;
    }

    function cerateActionBtn (innerText, onclickFunction, type, pullRight) {
      var type = type || 'default';
      var btn = document.createElement('input');
      btn.setAttribute('type', 'button');
      btn.classList.add('btn');
      if (type === 'default') {
        btn.classList.add('btn-primary');
      } else {
        btn.classList.add('btn-default');
      }
      if (pullRight) {
        btn.classList.add('pull-right');
      }
      btn.classList.add('btn-sm');
      btn.value = innerText;
      btn.addEventListener('click', onclickFunction);
      return btn;
    }

    function createCodeEditor (slotInfo, textarea) {
      let config = {};
      if (slotInfo.type === 'string') {
        config.lineWrapping = true;
        config.mode = 'text/plain';
      } else {
        config.matchBrackets = true;
        config.autoCloseBrackets = true;
        config.mode = 'application/json';
      }
      return CodeMirror.fromTextArea(textarea, config);
    }

    function createElementForSetValue (slotInfo) {
      var setValueDiv = document.createElement('div');
      var labelContainer = document.createElement('div');
      var label = document.createElement('label');
      label.innerText = 'Set value using a base value:'
      labelContainer.appendChild(label);
      setValueDiv.appendChild(labelContainer);
    
      setValueDiv.appendChild(createElementForUseCurrentRb(slotInfo));

      var slotVTF = generateInputForSlotValue(slotInfo);
      setValueDiv.appendChild(slotVTF);
      if (slotVTF.tagName === 'TEXTAREA') {
        slotVTF.value = slotInfo.type === 'string'? slotInfo.value: JSON.stringify(slotInfo.value, null, ' ');
        createCodeEditor(slotInfo, slotVTF);
      } else {
        slotVTF.value = JSON.stringify(slotInfo.value);
      }

      setValueDiv.appendChild(createSetValueBtn(slotInfo));
      setValueDiv.classList.add('set-slot-container');
      return setValueDiv;
    }


    function createSetValueBtn(slotInfo) {
      var slotVBtn = document.createElement('button');
      slotVBtn.setAttribute('data-slot-id', slotInfo.slotId);
      slotVBtn.setAttribute('data-slot-direction', slotInfo.direction);
      slotVBtn.setAttribute('data-slot-type', slotInfo.type);
      slotVBtn.innerHTML = 'Set';
      slotVBtn.title = 'Set value to slot';
      slotVBtn.className = 'btn btn-primary btn-sm pull-right'
      slotVBtn.addEventListener('click', postSetSlotMsg);
      return slotVBtn;
    }

    function createElementForCell (cellName, slotInfo) {
      switch (cellName) {
        case 'slotId':
          return createElementForSlotId(slotInfo);
        case 'slotValue':
          return createElementForSlotValue(slotInfo);
      }
    }

    function generateDescriptionTooltip (slotInfo) {
      var tooltip;
      if (slotInfo.description) {
        tooltip = document.createElement('i');
        tooltip.className = 'glyphicon glyphicon-info-sign';
        tooltip.setAttribute('title', slotInfo.description);
      }
      return tooltip;
    }

    function generateSlotInfoP (label, text) {
      var p = document.createElement('p');
      p.innerHTML = '<strong>' + label + ': </strong>' + text;
      return p;
    }

    function generateInputForSlotValue (slotInfo) {
      var input = document.createElement('input');
      switch (slotInfo.type) {
        case 'number':
          input.setAttribute('type', 'number');
          break;
        case 'boolean':
          input.setAttribute('type', 'checkbox');
          break;
        default:
          input = document.createElement('textarea');
          break;
      }
      input.classList.add('set-slot-input');
      input.setAttribute('id', generateIdForInputSlotElement(slotInfo.slotId, slotInfo.direction));
      input.setAttribute('data-slot-id', slotInfo.slotId);
      input.setAttribute('data-slot-type', slotInfo.type);
      input.setAttribute('data-slot-direction', slotInfo.direction);
      return input;
    }
  }

  function generateIdForInputSlotElement (slotId, slotDirection) {
    return slotId + '_' + slotDirection + '_' + 'inputElement';
  }

  function createElementForUseCurrentRb (slotInfo) {
    let container = document.createElement('div');
    let autosetCBLabel = document.createElement('label');
    let autosetCB = document.createElement('input');
    autosetCB.setAttribute('type', 'checkbox');
    autosetCBLabel.appendChild(autosetCB);
    autosetCBLabel.appendChild(document.createTextNode('Autoset'));
    autosetCBLabel.classList.add('checkbox-inline');
    autosetCBLabel.classList.add('pull-right');
    container.appendChild(createBaseCodeRB(slotInfo, 'current', autosetCB, true));
    container.appendChild(createBaseCodeRB(slotInfo, 'init', autosetCB));
    container.appendChild(createBaseCodeRB(slotInfo, 'first', autosetCB));
    container.appendChild(autosetCBLabel);
    return container;
  }

  function createBaseCodeRB (slotInfo, type, autosetCB, checked) {
    let labelText;
    let title;
    let baseValueKey;
    switch (type) {
      case 'current':
        labelText = 'Current';
        title = 'Use the current value of the slot as base for setting a new value';
        baseValueKey = 'value';
        break;
      case 'init':
        labelText = 'Initial';
        title = 'Use the manifest or TAG API initialization value as base for setting a new value';
        baseValueKey = 'init';
        break;
      case 'first':
        labelText = 'First captured';
        title = 'Use the value of the slot captured when the extension loaded as base for setting a new value';
        baseValueKey = 'firstValue';
        break;
    }
    var useOptionRB = document.createElement('input');
    useOptionRB.setAttribute('type', 'radio');
    useOptionRB.setAttribute('name', `baseSlotValue${slotInfo.slotId}${slotInfo.direction}`);
    useOptionRB.setAttribute('data-slot-id', slotInfo.slotId);
    useOptionRB.setAttribute('data-slot-direction', slotInfo.direction);
    useOptionRB.setAttribute('data-slot-type', slotInfo.type);
    useOptionRB.setAttribute('data-base-value-key', baseValueKey);
    if (type === 'init' && getSlotInfoInCubblesInfo(slotInfo, baseValueKey) === undefined) {
      useOptionRB.setAttribute('disabled', 'disabled');
    }
    useOptionRB.addEventListener('change', function (e) {
      handleUseBaseValueRB(e, autosetCB);
    });

    if (checked) {
      useOptionRB.checked = checked;
    }

    var label = document.createElement('label');
    label.classList.add('radio-inline');
    var text = document.createTextNode(`${labelText} `);
    label.title = title;

    var infoIcon = document.createElement('i');
    infoIcon.className = 'glyphicon glyphicon-info-sign';

    label.appendChild(useOptionRB);
    label.appendChild(text);
    label.appendChild(infoIcon);
    return label;
  }

  function handleUseBaseValueRB(e, autosetCB) {
    if (e.target.checked) {
      var slotInfo = {
        slotId: e.target.getAttribute('data-slot-id'),
        direction: e.target.getAttribute('data-slot-direction'),
        type: e.target.getAttribute('data-slot-type'),
      }
      var baseValueKey = e.target.getAttribute('data-base-value-key');
      updateSlotValueElement(slotInfo, getSlotInfoInCubblesInfo(slotInfo, baseValueKey));
      if (autosetCB.checked) {
        postSetSlotMsg(e);
      }
    }
  }

  /**
   * Listener function to use when set buttons are clicked
   * @param e
   */
  function postSetSlotMsg (e) {
    var slotId = e.target.getAttribute('data-slot-id');
    var slotType = e.target.getAttribute('data-slot-type');
    var slotDirection = e.target.getAttribute('data-slot-direction');
    var input = document.querySelector('#' + generateIdForInputSlotElement(slotId, slotDirection));
    var slotValue = parseSlotValue(input, slotType, slotId);
    if (slotId) {
      window.postMessageToBackgroundScript(
        'set-slot-value',
        {
          runtimeId: runtimeId,
          slotId: slotId,
          slotValue: slotValue
        }
      );
    }
  }

  /**
   * Parse a slot value so that it is valid to be set to the component
   * @param {string} slotType - Type of the slot
   * @param {string} slotId - Id of the slot
   * @param {Element} input - Input or textarea element
   * @returns {*}
   */
  function parseSlotValue (input, slotType, slotId) {
    var slotValue;
    if (input.tagName === 'TEXTAREA') {
      slotValue = input.nextElementSibling.CodeMirror.doc.getValue();
    } else {
      slotValue = input.value; 
    }
    switch (slotType) {
      case 'string':
        return slotValue;
      case 'number':
        return parseInt(slotValue);
      case 'boolean':
        return input.checked;
      default:
        try {
          return JSON.parse(slotValue);
        } catch (e) {
          logErrorMsg('It was not possible to parse the value for the \'' + slotId + '\' slot. ' +
            'Remember that it should be JSON valid. Please check the syntax.');
          return '';
        }
    }
  }

  /**
   * Log an error in the console of the inspected window
   * @param {string} ErrorMsg Error to be logged
   */
  function logErrorMsg (ErrorMsg) {
    chrome.devtools.inspectedWindow.eval('console.error("' + ErrorMsg + '")');
  }

  function setCubblesToTree (cubblesList) {
    cubblesInfo = {};
    $('#cubblesTree').jstree(true).settings.core.data = cubblesList;
    $('#cubblesTree').jstree(true).refresh(true);
  }

  function shouldHighlightCubble () {
    return document.getElementById('highlightCubbleCB').checked;
  }

  function shouldScrollToCubble () {
    return document.getElementById('scrollToCubbleCB').checked;
  }

  function setCubbleDepTree(runtimeId) {
    let depTreeViewer = document.getElementById('cubbleDepTree');
    if (depTreeViewer.setDepTree) {
      depTreeViewer.setDepTree(getDepTreeFromRuntimeId(runtimeId));
    }
  }

  function sendMessageToInjectedScript (message) {
    chrome.devtools.inspectedWindow.eval(`window.postMessageToInjectedScript(${JSON.stringify(message)})`,
        { useContentScriptContext: true });
  }

  function initCubblesTree() {
    $('#cubblesTree').on("changed.jstree", function (e, data) {
      if (data.hasOwnProperty('node')) {
        requestSlotsInfo(data.node.id);
        setCubbleDepTree(data.node.id);
        sendMessageToInjectedScript({ name: 'set-selected-cubble', content: data.node.id });
      }
    });
    $('#cubblesTree').on("refresh.jstree", function (e, data) {
      selectDefaultCubble();
    });
    $('#cubblesTree').on("hover_node.jstree", function (e, data) {
      if (shouldHighlightCubble() || shouldScrollToCubble()) {
        let content = { runtimeId: data.node.id, shouldScrollTo: shouldScrollToCubble(), shouldHighlight: shouldHighlightCubble() };
        sendMessageToInjectedScript({ name: 'inspect-cubble', content: content});
      }
    });
    $('#cubblesTree').on("dehover_node.jstree", function (e, data) {
      if (shouldHighlightCubble()) {
        sendMessageToInjectedScript({ name: 'de-inspect-cubble', content: data.node.id });
      }
    });
    $('#cubblesTreeContainer').on("mouseleave", function (e, data) {
      sendMessageToInjectedScript({ name: 'de-inspect-cubble', content: '' });
    });
    $('#cubblesTree').jstree({      
      core: {
        multiple: false,
        themes: {
          dots : false,
          icons: false
        }
      }
    });
    setInterval(requestSlotsInfo, 500);
  }

  function initSplit() {
    Split({
      columnGutters: [{
        track: 1,
        element: document.querySelector('.vertical-gutter'),
      }]
    })
  }

  function init () {
    appendHtmlElements();
    initCubblesTree();
    initSplit();
  }

  function selectDefaultCubble () {
    var instance = $('#cubblesTree').jstree(true);
    instance.deselect_all();
    instance.select_node([instance.settings.core.data[0].id]);
  }

  function hideElement (element) {
    element.classList.add('hidden');
  }

  function showElement (element) {
    element.classList.remove('hidden');
  }

  function extractDepsPathFromRuntimeId(runtimeId) {
    let deps = runtimeId.split(':').map(function (runtimeId) {
      let runtimeIdParts = runtimeId.split('/');
      return {
        webpackageId: runtimeIdParts[0],
        artifactId: runtimeIdParts[1].split('.')[0]
      }
    });
    return deps;
  }

  function getDepTreeFromRuntimeId(runtimeId) {
    let depsPath = extractDepsPathFromRuntimeId(runtimeId);
    let depTree = { _rootNodes: [] };
    let listOfNodes = currentDepTree._rootNodes;
    let foundNode;
    depsPath.forEach(function(node) {
      foundNode = findNodeInList(node, listOfNodes);
      if (foundNode) {
        listOfNodes = foundNode.children;
      }
    });
    depTree._rootNodes.push(foundNode);
    return depTree;
  }

  function findNodeInList(nodeToFind, list) {
    for (i=0; i < list.length; i++) {
      node = list[i];
      if (node.data.artifactId === nodeToFind.artifactId
        && node.data.webpackageId === nodeToFind.webpackageId){
          return node;
        }
    }
    return undefined;
  }

  init();
})();
