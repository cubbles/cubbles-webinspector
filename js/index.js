/* globals $ */
(function () {
  'use strict';
  window.handleInitialScale = function (tabId, viewer) {
    var tab = $('#' + tabId);
    if ($('ul.nav-tabs li.active a').attr('id') === tabId) {
      viewer.setScale('auto');
    } else {
      viewer.setScale('none');
      tab.click(function (e) {
        if (e.target.id === tabId) {
          setTimeout(function () {
            viewer.setScale('auto');
          }, 500);
          tab.off('click');
        }
      });
    }
  };
})();
