/* globals hljs, chrome */
(function () {
  var runtimeId;
  /**
   * Method to update slots information of a cubbles within the sidebar panel
   * @param slotsInfo - {inputSlots: ..., outputSlots: ...}
   */
  window.setInputSlotsInfo = function (slotsInfo) {
    if (slotsInfo.inputSlots && slotsInfo.outputSlots) {
      runtimeId = slotsInfo.runtimeId;
      updateSlotsInfoInTables(slotsInfo.inputSlots, document.querySelector('#inputSlotsTable'));
      updateSlotsInfoInTables(slotsInfo.outputSlots, document.querySelector('#outputSlotsTable'));
      toggleCubblesMsg(false);
    } else {
      toggleCubblesMsg(true);
    }
  };

  /**
   * Update the table that contains the slots info of the selected component (if any)
   * @param {Array} slots
   * @param {Element} table
   */
  function updateSlotsInfoInTables (slots, table) {
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
      var type = row.insertCell(1);
      var value = row.insertCell(2);
      var setValue = row.insertCell(3);

      type.innerHTML = slotInfo.type;
      slotId.appendChild(createElementForCell('slotId', slotInfo));
      value.appendChild(createElementForCell('slotValue', slotInfo));
      hljs.highlightBlock(value);
      setValue.appendChild(createElementForCell('setValue', slotInfo));
    }

    function createElementForCell (cellName, slotInfo) {
      switch (cellName) {
        case 'slotId':
          var strongElement = document.createElement('strong');
          strongElement.innerHTML = slotInfo.slotId;
          return strongElement;
        case 'slotValue':
          var codeElement = document.createElement('code');
          codeElement.innerHTML = JSON.stringify(slotInfo.value, null, '   ');
          codeElement.classList.add('JSON');
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
          return setValueDiv;
      }
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
    if (slotId && slotValue) {
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
})();
