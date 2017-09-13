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

      var strongElement = document.createElement('strong');
      strongElement.innerHTML = slotInfo.slotId;
      slotId.appendChild(strongElement);

      var codeElement = document.createElement('code');
      codeElement.innerHTML = JSON.stringify(slotInfo.value, null, '   ');
      codeElement.className = 'JSON';
      value.appendChild(codeElement);
      hljs.highlightBlock(value);
      var slotVTF = generateInputForSlotValue(slotInfo.type);
      slotVTF.setAttribute('id', slotInfo.slotId + 'TF');
      var slotVBtn = document.createElement('button');
      slotVBtn.setAttribute('data-slot-id', slotInfo.slotId);
      slotVBtn.setAttribute('data-slot-type', slotInfo.type);
      slotVBtn.innerHTML = 'Set';
      slotVBtn.addEventListener('click', postSetSlotMsg);
      setValue.appendChild(slotVTF);
      setValue.appendChild(slotVBtn);
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
          input.setAttribute('type', 'text');
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
    var slotValue = input.value;
    if (slotId && slotValue) {
      switch (slotType) {
        case 'string':
          slotValue = '"' + slotValue + '"';
          break;
        case 'number':
          slotValue = parseInt(slotValue);
          break;
        case 'boolean':
          slotValue = input.checked;
          break;
        default:
          try {
            slotValue = JSON.parse(slotValue);
          } catch (e) {
            logErrorMsg('It was not possible to parse the value for the \'' + slotId + '\' slot. ' +
              'Remember that it should be JSON valid. Please check the syntax.');
            slotValue = '';
          }
          break;
      }
      if (slotValue) {
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
