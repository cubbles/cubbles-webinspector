/* globals hljs */
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
      var value = row.insertCell(1);
      var codeElement = document.createElement('code');
      slotId.innerHTML = slotInfo.slotId;
      codeElement.innerHTML = JSON.stringify(slotInfo.value, null, '   ');
      codeElement.className = 'JSON';
      value.appendChild(codeElement);
      hljs.highlightBlock(value);
      var setValue = row.insertCell(2);
      var slotVTF = document.createElement('input');
      slotVTF.setAttribute('id', slotInfo.slotId + 'TF');
      var slotVBtn = document.createElement('button');
      slotVBtn.setAttribute('data-slot-id', slotInfo.slotId);
      slotVBtn.innerHTML = 'Set';
      slotVBtn.addEventListener('click', postSetSlotMsg);
      setValue.appendChild(slotVTF);
      setValue.appendChild(slotVBtn);
    }
  }

  /**
   * Listener function to use when set buttons are clicked
   * @param e
   */
  function postSetSlotMsg (e) {
    var slotId = e.target.getAttribute('data-slot-id');
    if (slotId) {
      window.postMessageToBackgroundScript(
        'set-slot-value',
        {
          runtimeId: runtimeId,
          slotId: slotId,
          slotValue: document.querySelector('#' + slotId + 'TF').value
        }
      );
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
})();
