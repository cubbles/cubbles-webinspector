/* globals $ */
(function () {
  'use strict';
  window.addOnShownListener = function (tabId, viewer, onlyOnce) {
    var tab = $('#' + tabId);
    tab.click(function (e) {
      if (e.target.id === tabId) {
        setTimeout(function () {
          viewer.setScale('auto');
        }, 500);
      }
      if (onlyOnce) {
        tab.off('click');
      }
    });
  };
})();
