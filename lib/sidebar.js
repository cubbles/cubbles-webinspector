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
        runtimeId = slotsInfo.runtimeId;
        createSlotsInfoElementsInTables(slotsInfo.inputSlots, document.querySelector('#inputSlotsTable'));
        createSlotsInfoElementsInTables(slotsInfo.outputSlots, document.querySelector('#outputSlotsTable'));
      } else {
        updateSlotsValues(slotsInfo);
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
      updateCodePreElement(document.querySelector('code [data-slot-id="' + slotInfo.slotId + '"]'), slotInfo.value);
    }
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

    function createElementForCell (cellName, slotInfo) {
      switch (cellName) {
        case 'slotId':
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
        case 'slotValue':
          var codeElement = document.createElement('code');
          var preElement = document.createElement('pre');
          preElement.classList.add('JSON');
          updateCodePreElement(preElement, slotInfo.value);
          preElement.setAttribute('data-slot-id', slotInfo.slotId);
          codeElement.appendChild(preElement);
          var codeContainer = document.createElement('div');
          codeContainer.classList.add('table-code');
          codeContainer.appendChild(codeElement);
          return codeContainer;
        case 'setValue':
          var slotVTF = generateInputForSlotValue(slotInfo.type);
          slotVTF.setAttribute('id', slotInfo.slotId + 'TF');
          var slotVBtn = document.createElement('button');
          slotVBtn.setAttribute('data-slot-id', slotInfo.slotId);
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

  /**
   * Listener function to use when set buttons are clicked
   * @param e
   */
  function postSetSlotMsg (e) {
    var slotId = e.target.getAttribute('data-slot-id');
    var slotType = e.target.getAttribute('data-slot-type');
    var input = document.querySelector('#' + slotId + 'TF');
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
