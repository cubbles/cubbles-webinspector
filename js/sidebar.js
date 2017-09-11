(function () {
  window.setInputSlotsInfo = function (slotsInfo) {
    setSlotsInfoInTables(slotsInfo.inputSlots, document.querySelector('#inputSlotsTable'));
    setSlotsInfoInTables(slotsInfo.outputSlots, document.querySelector('#outputSlotsTable'));
  };

  function setSlotsInfoInTables (slots, table) {
    clearTable(table);
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
    slotId.innerHTML = slotInfo.slotId;
    value.innerHTML = JSON.stringify(slotInfo.value, null, '   ');
  }
})();
