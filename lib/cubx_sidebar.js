/* globals hljs, chrome */
(function () {
  var runtimeId;
  /**
   * Method to update slots information of a cubbles within the sidebar panel
   * @param slotsInfo - {inputSlots: ..., outputSlots: ...}
   */
  window.setInputSlotsInfo = function (slotsInfo) {
    if (slotsInfo.inputSlots && slotsInfo.outputSlots) {
      if (slotsInfo.runtimeId !== runtimeId) {
        updateSidebarTitle(slotsInfo);
        runtimeId = slotsInfo.runtimeId;
        createSlotsInfoElementsInTables(slotsInfo.inputSlots, document.querySelector('#inputSlotsTable'));
        createSlotsInfoElementsInTables(slotsInfo.outputSlots, document.querySelector('#outputSlotsTable'));
      } else {
        updateSidebar(slotsInfo);
      }
      toggleCubblesMsg(false);
    } else {
      toggleCubblesMsg(true);
    }
  };

  function updateSidebar (slotsInfo) {
    updateSidebarTitle(slotsInfo);
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
      updateSlotValueElement(document.querySelector(selector), slotInfo.value);
      if (slotInfo.type === 'boolean') {
        var checkbox = document.querySelector('#' + generateIdForInputSlotElement(slotInfo.slotId, slotInfo.direction));
        updateCheckbox(checkbox, slotInfo.value);
      }
    }
  }

  function updateCheckbox(element, value) {
    element.checked = value;
  }

  function updateSlotValueElement (element, codeValue) {
    var codeText = JSON.stringify(codeValue, null, '  ');
    element.setAttribute('data-slot-value', typeof codeValue === 'string'? codeValue : codeText);
    $(element).jsonViewer(codeValue, {collapsed: false, withQuotes: true});
  }

  /**
   * Append tables where information will be displayed
   */
  function appendHtmlElements () {
    var tablesContainer = document.querySelector('#slotsInfo');
    appendSidebarTitle(tablesContainer);
    appendSlotTables(tablesContainer);
  }

  function appendSidebarTitle (container) {
    var sidebarTitle = document.createElement('h1');
    sidebarTitle.setAttribute('id', 'sidebarTitle');
    container.appendChild(sidebarTitle);
  }
  function appendSlotTables(tablesContainer) {
    var headers = ['Slot Id', 'Current value', '', ''];
    var colClasses = ['slot-id-col', 'current-value-col', 'use-current-col', 'set-value-col'];
    var inputTableTitle = document.createElement('h2');
    var outputTableTitle = document.createElement('h2');
    inputTableTitle.innerHTML = 'Input Slots';
    outputTableTitle.innerHTML = 'Output Slots';
    tablesContainer.appendChild(inputTableTitle);
    tablesContainer.appendChild(generateTableElement(headers, colClasses, 'inputSlotsTable'));
    tablesContainer.appendChild(outputTableTitle);
    tablesContainer.appendChild(generateTableElement(headers, colClasses, 'outputSlotsTable'));
  }

  function generateTableElement (headers, colClasses, id) {
    var table = document.createElement('table');
    var colgroup = document.createElement('colgroup');
    var thead = document.createElement('thead');
    var tbody = document.createElement('tbody');
    var trThead = document.createElement('tr');
    headers.forEach(function (header) {
      var th = document.createElement('th');
      th.innerText = header;
      trThead.appendChild(th);
    });
    colClasses.forEach(function (colClass) {
      var col = document.createElement('col');
      col.classList.add(colClass);
      colgroup.appendChild(col);
    });
    if (id) {
      table.setAttribute('id', id);
    }
    thead.appendChild(trThead);
    table.appendChild(colgroup);
    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
  }

  /**
   * Update the table that contains the slots info of the selected component (if any)
   * @param {Array} slots
   * @param {Element} table
   */
  function createSlotsInfoElementsInTables (slots, table) {
    clearTable(table);
    if (slots) {
      slots.forEach(function (slot) {
        createSlotInfoRow(slot, table);
      });
    }

    function clearTable (table) {
      for (var i = 1, length = table.rows.length; i < length; i++) {
        table.deleteRow(1);
      }
    }

    function createSlotInfoRow (slotInfo, table) {
      var tbody = table.getElementsByTagName('tbody')[0];
      var row = tbody.insertRow(tbody.rows.length);
      var slotId = row.insertCell(0);
      var value = row.insertCell(1);
      var useCurrent = row.insertCell(2);
      var setValue = row.insertCell(3);

      slotId.appendChild(createElementForCell('slotId', slotInfo));
      value.appendChild(createElementForCell('slotValue', slotInfo));
      useCurrent.appendChild(createElementForCell('useCurrent', slotInfo));
      setValue.appendChild(createElementForCell('setValue', slotInfo));
    }

    function createElementForSlotId (slotInfo) {
      var container = document.createElement('div');
      var slotInfoDiv = document.createElement('div');
      var slotIdElement = document.createElement('strong');
      slotIdElement.innerHTML = slotInfo.slotId;
      var typeElement = document.createElement('div');
      typeElement.innerHTML = slotInfo.type;
      slotInfoDiv.appendChild(slotIdElement);
      var tooltip = generateDescriptionTooltip(slotInfo);
      if (tooltip) {
        slotInfoDiv.appendChild(tooltip);
      }
      container.appendChild(slotInfoDiv);
      container.appendChild(typeElement);
      container.classList.add('slot-id-container');
      return container;
    }

    function createElementForSlotValue (slotInfo) {
      var preElement = document.createElement('pre');
      preElement.classList.add('slot-value-element');
      updateSlotValueElement(preElement, slotInfo.value);
      preElement.setAttribute('data-slot-id', slotInfo.slotId);
      preElement.setAttribute('data-slot-direction', slotInfo.direction);
      return preElement;
    }

    function createElementForSetValue (slotInfo) {
      var slotVTF = generateInputForSlotValue(slotInfo);
      var slotVBtn = createSetValueBtn(slotInfo);
      var setValueDiv = document.createElement('div');
      setValueDiv.appendChild(slotVTF);
      setValueDiv.appendChild(slotVBtn);
      setValueDiv.classList.add('set-slot-container');
      return setValueDiv;
    }


    function createSetValueBtn(slotInfo) {
      var slotVBtn = document.createElement('button');
      slotVBtn.setAttribute('data-slot-id', slotInfo.slotId);
      slotVBtn.setAttribute('data-slot-direction', slotInfo.direction);
      slotVBtn.setAttribute('data-slot-type', slotInfo.type);
      slotVBtn.classList.add('right-button');
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
        tooltip = document.createElement('span');
        tooltip.innerHTML = '&#128712;';
        tooltip.classList.add('tooltip');
        var tooltipText = generateSlotInfoP('Description', slotInfo.description);
        tooltipText.classList.add('tooltiptext');
        tooltip.appendChild(tooltipText);
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
      input.setAttribute('data-slot-direction', slotInfo.direction);
      return input;
    }
  }

  function generateIdForInputSlotElement (slotId, slotDirection) {
    return slotId + '_' + slotDirection + '_' + 'inputElement';
  }

  function createElementForUseCurrent (slotInfo) {
    var container = document.createElement('div');
    container.classList.add('use-current-container');
    if (slotInfo.type !== 'boolean') {
      var useCurrentBtn = document.createElement('button');
      useCurrentBtn.innerHTML = '>>';
      useCurrentBtn.title = 'Use current slot value as base for setting a new value';
      useCurrentBtn.setAttribute('data-slot-id', slotInfo.slotId);
      useCurrentBtn.setAttribute('data-slot-direction', slotInfo.direction);
      useCurrentBtn.addEventListener('click', handleSetCurrentValueBtn);
      container.appendChild(useCurrentBtn);
    }
    return container;
  }

  function handleSetCurrentValueBtn(e) {
    var slotId = this.getAttribute('data-slot-id');
    var direction = this.getAttribute('data-slot-direction');
    var selector = '[data-slot-id="' + slotId + '"][data-slot-direction="' + direction + '"]';
    var valueElement = document.querySelector('.slot-value-element' + selector);
    var inputElement = document.querySelector('.set-slot-input' + selector);
    inputElement.value = valueElement.getAttribute('data-slot-value');
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
    var slotValue = input.value;
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

  appendHtmlElements();
})();
