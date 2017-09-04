/* globals $ */
(function () {
  'use strict';
  window.addOnShownListener = function (tabId, viewer, getInfoCb) {
    $('#' + tabId).click(function (e) {
      if (e.target.id === tabId) {
        setTimeout(function () {
          getInfoCb();
          viewer.setScale('auto');
        }, 500);
      }
    });
  };
})();
