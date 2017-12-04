/* globals hljs, chrome */
(function () {
  var runtimeId;
  var lastSlotInfo = '';
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
        var newSlotsInfo = JSON.stringify(slotsInfo);
        if (lastSlotInfo !== newSlotsInfo) {
          lastSlotInfo = newSlotsInfo;
          updateSlotsValues(slotsInfo);
        }
      }
      toggleCubblesMsg(false);
    } else {
      toggleCubblesMsg(true);
    }
  };

  function updateSlotsValues (slotsInfo) {
    slotsInfo.inputSlots.forEach(updateSlotValueElement);
    slotsInfo.outputSlots.forEach(updateSlotValueElement);

    function updateSlotValueElement (slotInfo) {
      var selector = 'pre [data-slot-id="' + slotInfo.slotId + '"][data-slot-direction="' + slotInfo.direction + '"]';
      updateCodePreElement(document.querySelector(selector), slotInfo.value);
      if (slotInfo.type === 'boolean') {
        var checkbox = document.querySelector('#' + generateIdForInputSlotElement(slotInfo.slotId, slotInfo.direction));
        updateCheckbox(checkbox, slotInfo.value);
      }
    }
  }

  function updateCheckbox(element, value) {
    element.checked = value;
  }

  function updateCodePreElement (element, codeText) {
    element.innerHTML = JSON.stringify(codeText, null, '  ');
    hljs.highlightBlock(element);
  }

  /**
   * Append tables where information will be displayed
   */
  function appendSlotTables () {
    var headers = ['Slot Id', 'Current value', ''];
    var colClasses = ['slot-id-col', 'current-value-col', 'set-value-col'];
    var tablesContainer = document.querySelector('#slotsInfo');
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
      var row = table.insertRow(table.rows.length);
      var slotId = row.insertCell(0);
      var value = row.insertCell(1);
      var setValue = row.insertCell(2);

      slotId.appendChild(createElementForCell('slotId', slotInfo));
      value.appendChild(createElementForCell('slotValue', slotInfo));
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
      var codeElement = document.createElement('pre');
      codeElement.classList.add('table-code');
      var preElement = document.createElement('code');
      preElement.classList.add('JSON');
      updateCodePreElement(preElement, slotInfo.value);
      preElement.setAttribute('data-slot-id', slotInfo.slotId);
      preElement.setAttribute('data-slot-direction', slotInfo.direction);
      codeElement.appendChild(preElement);
      return codeElement;
    }

    function createElementForSetValue (slotInfo) {
      var slotVTF = generateInputForSlotValue(slotInfo.type);
      slotVTF.setAttribute('id', generateIdForInputSlotElement(slotInfo.slotId, slotInfo.direction));
      var slotVBtn = document.createElement('button');
      slotVBtn.setAttribute('data-slot-id', slotInfo.slotId);
      slotVBtn.setAttribute('data-slot-direction', slotInfo.direction);
      slotVBtn.setAttribute('data-slot-type', slotInfo.type);
      slotVBtn.classList.add('right-button');
      slotVBtn.innerHTML = 'Set';
      slotVBtn.addEventListener('click', postSetSlotMsg);
      var setValueDiv = document.createElement('div');
      setValueDiv.appendChild(slotVTF);
      setValueDiv.appendChild(slotVBtn);
      setValueDiv.classList.add('set-slot-container');
      return setValueDiv;
    }

    function createElementForCell (cellName, slotInfo) {
      switch (cellName) {
        case 'slotId':
          return createElementForSlotId(slotInfo);
        case 'slotValue':
          return createElementForSlotValue(slotInfo);
        case 'setValue':
          return createElementForSetValue(slotInfo);
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

    function generateInputForSlotValue (type) {
      var input = document.createElement('input');
      switch (type) {
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
      return input;
    }
  }

  function generateIdForInputSlotElement (slotId, slotDirection) {
    return slotId + '_' + slotDirection + '_' + 'inputElement';
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

  appendSlotTables();
})();
