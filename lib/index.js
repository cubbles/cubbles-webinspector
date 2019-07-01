/* globals $ */
(function () {
  'use strict';
  var DEP_TREE_VWR_TAB_ID = 'depsTreeViewerT';
  window.addOnShownListener = function (tabId, viewer, onlyOnce, onShownCallback) {
    var tab = $('#' + tabId);
    tab.click(function (e) {
      if (e.target.id === tabId) {
        setTimeout(function () {
          if (onShownCallback && typeof onShownCallback === 'function') {
            onShownCallback();
          }
          // autoScaleViewer(viewer);
        }, 500);
      }
      if (onlyOnce) {
        tab.off('click');
      }
    });
  };

  window.handleDepTreesAutoScale = function (depViewer) {
    if (depViewer.status === 'ready') {
      $('.panel-heading.cubx-dep-tree-viewer').on('click', function () {
        var self = this;
        setTimeout(function () {
          var collapsiblePanel = self.parentNode.querySelector('.panel-collapse');
          if (collapsiblePanel.getAttribute('aria-expanded') === 'true') {
            $(collapsiblePanel).trigger('show.bs.collapse');
            setTimeout(function () {
              $(collapsiblePanel).trigger('shown.bs.collapse');
            }, 300);
          } else {
            $(collapsiblePanel).trigger('hide.bs.collapse');
          }
        }, 200);
      });
    } else {
      setTimeout(handleDepTreesAutoScale.call(this, depViewer), 200);
    }
  };

  function autoScaleViewer(viewer) {
    viewer.setScale('auto');
  }

  function isDepTreeTab(tabId) {
    return tabId === DEP_TREE_VWR_TAB_ID;
  }
})();
