/* globals hljs, chrome */
(function () {
  var runtimeId;
  const COL_CLASSES = [
    'col-lg-2 col-md-2 col-sm-2',
    'col-lg-4 col-md-4 col-sm-4',
    'col-lg-1 col-md-1 col-sm-1',
    'col-lg-5 col-md-5 col-sm-5'
  ];

  /**
   * Method to update slots information of a cubbles within the sidebar panel
   * @param slotsInfo - {inputSlots: ..., outputSlots: ...}
   */
  window.setInputSlotsInfo = function (slotsInfo) {
    if (slotsInfo.inputSlots && slotsInfo.outputSlots) {
      if (slotsInfo.runtimeId !== runtimeId) {
        runtimeId = slotsInfo.runtimeId;
        createSlotsInfoElementsInTables(slotsInfo.inputSlots, document.querySelector('#inputSlotsTable'));
        createSlotsInfoElementsInTables(slotsInfo.outputSlots, document.querySelector('#outputSlotsTable'));
      } else {
        updateSidebar(slotsInfo);
      }
    }
  };

  window.setCubblesList = function (cubbles) {
    setCubblesToTree(cubbles);
  }

  function updateSidebarSlotsInfo (targetRuntimeId) {
    targetRuntimeId = targetRuntimeId || runtimeId;
    chrome.devtools.inspectedWindow.eval(`window.getSlotsInfo('${targetRuntimeId}')`,
      { useContentScriptContext: true });
    
  }

  function updateSidebar (slotsInfo) {
    updateSlotsValues(slotsInfo);
  }

  function updateSidebarTitle (slotsInfo) {
    document.querySelector('#sidebarTitle').innerHTML = '&lt;' + slotsInfo.artifactId + '&gt;';
  }

  function updateSlotsValues (slotsInfo) {
    slotsInfo.inputSlots.forEach(updateSlotValueElement);
    slotsInfo.outputSlots.forEach(updateSlotValueElement);

    function updateSlotValueElement (slotInfo) {
      var selector = 'pre[data-slot-id="' + slotInfo.slotId + '"][data-slot-direction="' + slotInfo.direction + '"]';
      setJsonToSlotValueElement(document.querySelector(selector), slotInfo.value);
      var inputElement = document.querySelector('#' + generateIdForInputSlotElement(slotInfo.slotId, slotInfo.direction));
      if (slotInfo.type === 'boolean') {
        updateCheckbox(inputElement, slotInfo.value);
      }
    }
  }

  function updateCheckbox(element, value) {
    element.checked = value;
  }

  function setJsonToSlotValueElement (element, codeValue) {
    var codeText = JSON.stringify(codeValue, null, '  ');
    element.setAttribute('data-slot-value', typeof codeValue === 'string'? codeValue : codeText);
    $(element).jsonViewer(codeValue, {collapsed: false, withQuotes: true});
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
    var headers = ['Slot Id <small>[type]</small>', 'Current value', '', 'Set new value'];
    var inputTableTitle = document.createElement('h2');
    var outputTableTitle = document.createElement('h2');
    inputTableTitle.innerHTML = 'Input Slots';
    outputTableTitle.innerHTML = 'Output Slots';
    tablesContainer.appendChild(inputTableTitle);
    tablesContainer.appendChild(generateTableElement(headers, COL_CLASSES, 'inputSlotsTable'));
    tablesContainer.appendChild(outputTableTitle);
    tablesContainer.appendChild(generateTableElement(headers, COL_CLASSES, 'outputSlotsTable'));
  }

  function generateTableElement (headers, colClasses, id) {
    var table = document.createElement('div');
    var headerDiv = document.createElement('div');
    headerDiv.className = 'head row row-no-gutters';

    headers.forEach(function (headerText, i) {
      let header = document.createElement('div');
      header.className = colClasses[i];
      header.innerHTML = `<strong>${headerText}</strong>`;
      headerDiv.appendChild(header);
    });
    if (id) {
      table.setAttribute('id', id);
    }

    var bodyDiv = document.createElement('div');
    bodyDiv.className = 'body';

    table.appendChild(headerDiv);
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
      const ids = ['slotId', 'slotValue', 'useCurrent', 'setValue'];
      ids.forEach(function (id, i) {
        let container = document.createElement('div');
        container.className = COL_CLASSES[i];
        container.appendChild(createElementForCell(id, slotInfo));
        row.appendChild(container);
      });
      table.querySelector('.body').appendChild(row);

    }

    function createElementForSlotId (slotInfo) {
      var container = document.createElement('div');
      var slotInfoDiv = document.createElement('div');
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
      var codeElement = document.createElement('div');
      codeElement.classList.add('slot-value-element-container');
      var preElement = document.createElement('pre');
      preElement.classList.add('slot-value-element');
      setJsonToSlotValueElement(preElement, slotInfo.value);
      preElement.setAttribute('data-slot-id', slotInfo.slotId);
      preElement.setAttribute('data-slot-direction', slotInfo.direction);
      codeElement.appendChild(preElement);
      return codeElement;
    }

    function createElementForSetValue (slotInfo) {
      var slotVTF = generateInputForSlotValue(slotInfo);
      var slotVBtn = createSetValueBtn(slotInfo);
      var setValueDiv = document.createElement('div');
      setValueDiv.appendChild(slotVTF);
      if (slotVTF.tagName === 'TEXTAREA') {
        let config = { mode: 'text/plain' };
        if (slotInfo.type === 'string') {
          config.lineWrapping = true;
        } else {
          config.matchBrackets = true;
          config.autoCloseBrackets = true;
          config.mode = 'application/json';
        }
        CodeMirror.fromTextArea(slotVTF, config);
      }
      setValueDiv.appendChild(slotVBtn);
      setValueDiv.classList.add('set-slot-container');
      return setValueDiv;
    }


    function createSetValueBtn(slotInfo) {
      var slotVBtn = document.createElement('button');
      slotVBtn.setAttribute('data-slot-id', slotInfo.slotId);
      slotVBtn.setAttribute('data-slot-direction', slotInfo.direction);
      slotVBtn.setAttribute('data-slot-type', slotInfo.type);
      slotVBtn.classList.add('pull-right');
      slotVBtn.innerHTML = 'Set';
      slotVBtn.title = 'Set value to slot';
      slotVBtn.addEventListener('click', postSetSlotMsg);
      return slotVBtn;
    }

    function createElementForCell (cellName, slotInfo) {
      switch (cellName) {
        case 'slotId':
          return createElementForSlotId(slotInfo);
        case 'slotValue':
          return createElementForSlotValue(slotInfo);
        case 'setValue':
          return createElementForSetValue(slotInfo);
        case 'useCurrent':
          return createElementForUseCurrent(slotInfo);
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

  function createElementForUseCurrent (slotInfo) {
    var container = document.createElement('div');
    container.classList.add('text-center');
    if (slotInfo.type !== 'boolean') {
      var useCurrentBtn = document.createElement('button');
      useCurrentBtn.innerHTML = '>>';
      useCurrentBtn.title = 'Use current slot value as base for setting a new value';
      useCurrentBtn.setAttribute('data-slot-id', slotInfo.slotId);
      useCurrentBtn.setAttribute('data-slot-direction', slotInfo.direction);
      useCurrentBtn.setAttribute('data-slot-type', slotInfo.type);
      useCurrentBtn.addEventListener('click', handleSetCurrentValueBtn);
      container.appendChild(useCurrentBtn);
    }
    return container;
  }

  function handleSetCurrentValueBtn(e) {
    var slotId = this.getAttribute('data-slot-id');
    var type = this.getAttribute('data-slot-type');
    var direction = this.getAttribute('data-slot-direction');
    var selector = '[data-slot-id="' + slotId + '"][data-slot-direction="' + direction + '"]';
    var valueElement = document.querySelector('.slot-value-element' + selector);
    var inputElement = document.querySelector('.set-slot-input' + selector);
    var value = valueElement.getAttribute('data-slot-value');
    if (inputElement.tagName === 'TEXTAREA') {
      inputElement.nextElementSibling.CodeMirror.doc.setValue(value);
    } else {
      inputElement.value = value;
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
   * Hide or display the "no cubbles" message and the slots info table
   * @param {boolean} display
   */
  function toggleCubblesMsg (display) {
    var noCubblesMessage = document.querySelector('#noCubblesMessage');
    var slotsInfo = document.querySelector('#slotsInfo');
    var hiddenClassName = 'hidden';

    if (display) {
      noCubblesMessage.classList.remove(hiddenClassName);
      slotsInfo.classList.add(hiddenClassName);
    } else {
      slotsInfo.classList.remove(hiddenClassName);
      noCubblesMessage.classList.add(hiddenClassName);
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
    $('#cubblesTree').jstree(true).settings.core.data = cubblesList;
    $('#cubblesTree').jstree(true).refresh(true);
  }

  function init () {
    appendHtmlElements();
    $('#cubblesTree').on("changed.jstree", function (e, data) {
      if (data.hasOwnProperty('node')) {
        updateSidebarSlotsInfo(data.node.id);
      }
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
    setInterval(updateSidebarSlotsInfo, 500);
  }

  init();
})();
