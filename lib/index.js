/* globals $ */
(function () {
  'use strict';
  window.addOnShownListener = function (tabId, viewer, onlyOnce, onShownCallback) {
    var tab = $('#' + tabId);
    tab.click(function (e) {
      if (e.target.id === tabId) {
        setTimeout(function () {
          if (onShownCallback && typeof onShownCallback === 'function') {
            onShownCallback();
          }
          viewer.setScale('auto');
        }, 500);
      }
      if (onlyOnce) {
        tab.off('click');
      }
    });
  };
})();
