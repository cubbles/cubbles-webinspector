/* global d3 */
(function () {
  'use strict';
  /**
   * Get help:
   * > Lifecycle callbacks:
   * https://www.polymer-project.org/1.0/docs/devguide/registering-elements.html#lifecycle-callbacks
   *
   * Access the Cubbles-Component-Model:
   * > Access slot values:
   * slot 'a': this.getA(); | this.setA(value)
   */
  CubxPolymer({
    is: 'cubx-dep-tree-viewer',

    NODE_WIDTH: 240,
    NODE_HEIGHT: 10,
    VIEW_HOLDER_ID: 'viewerDiv',
    status: 'init',

    /**
     * Manipulate an element’s local DOM when the element is created.
     */
    created: function () {
    },

    /**
     * Manipulate an element’s local DOM when the element is created and initialized.
     */
    ready: function () {
    },

    /**
     * Manipulate an element’s local DOM when the element is attached to the document.
     */
    attached: function () {
    },

    /**
     * Manipulate an element’s local DOM when the cubbles framework is initialized and ready to work.
     */
    cubxReady: function () {
    },

    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'rootNode' has changed ...
     */
    modelDepTreeChanged: function (depTree) {
      this._clearViewer();
      for (var i = 0; i < depTree._rootNodes.length; i++) {
        this._appendTree(depTree._rootNodes[i], i);
      }
    },

    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'scale' has changed ...
     */
    modelScaleChanged: function (scale) {
      var self = this;
      if (this.status === 'ready') {
        if (!this._isValidScale(scale)) {
          console.error('Invalid value of scale. Possible values are \'none\', \'auto\', or a positive float ' +
            'passed as STRING.');
          return;
        }
        if (scale === 'none') {
          return;
        }
        d3.select(Polymer.dom(this.root)).selectAll('svg').call(function (svg) {
          self._scaleAndCenterTree(svg, svg.select('g'), scale);
        });
      }
    },

    /**
     * Indicate whether the given 'scale' is valid
     * @param {string} scale - Scale to be validated
     * @returns {boolean} True if scale is valid, otherwise false
     * @private
     */
    _isValidScale: function (scale) {
      if (!scale) {
        return false;
      }
      if (scale !== 'auto' && scale !== 'none') {
        scale = parseFloat(scale);
        if (isNaN(scale)) {
          return false;
        }
      }
      if (scale < 0) {
        return false;
      }
      return true;
    },

    /**
     * Clears the dependency trees container
     * @private
     */
    _clearViewer: function () {
      d3.select(this.$$('#' + this.VIEW_HOLDER_ID)).html('');
    },

    _createTreePanel: function () {
      var viewerDiv = d3.select(this.$$('#' + this.VIEW_HOLDER_ID));
      var panel;
      panel = viewerDiv
        .append('div')
        .attr('class', this._addScopeToClassName('panel panel-default'));
      return panel;
    },

    _addHeadingToTreePanel: function (treePanel, treeRootData, treeIndex) {
      var treeHeading = treePanel
        .append('div')
        .attr('class', this._addScopeToClassName('panel-heading'));
      var treeTitle = treeHeading
        .append('h2')
        .attr('class', this._addScopeToClassName('panel-title'));
      var treeTitleToggle = treeTitle
        .append('a')
        .attr('data-toggle', 'collapse')
        .attr('data-parent', '#' + this.VIEW_HOLDER_ID)
        .attr('href', '#' + this._generateTreeId(treeIndex));
      treeTitleToggle.append('text')
        .text(this._generateTreeTitleText(treeRootData));
      treeTitleToggle.append('span')
        .attr('class', this._addScopeToClassName('glyphicon glyphicon-chevron-down pull-right'));
    },

    _generateTreeTitleText: function (treeRootData) {
      return treeRootData.webpackageId + '/' + treeRootData.artifactId
    },

    _addCollapseBodyToTreePanel: function (treePanel, treeIndex) {
    return treePanel.append('div')
        .style('width', this.getWidth())
        .style('height', this.getHeight())
        .attr('id', this._generateTreeId(treeIndex))
        .attr('class', this._addScopeToClassName('panel-collapse collapse svgContainer'))
        .append('div')
    },

    _createSvgForTree: function (containerPanel) {
      var svg = containerPanel.append('svg')
        .attr('width', '100%')
        .attr('height', this.getHeight());
      this._setTooltipCapabilityToSvg(svg, function getResourcesMessage (d) {
        var resources = d.data.resources;
        var msg = '<strong>Resources:</strong><br>';
        for (var i = 0; i < resources.length; i++) {
          msg += '<strong>' + (i + 1) + '. </strong>' +
            JSON.stringify(resources[i], null, '   ') + '<br>';
        }
        return msg;
      });
      return svg;
    },

    _generateTreeLayout: function () {
      return d3.layout.tree()
        .nodeSize([this.NODE_HEIGHT, this.NODE_WIDTH])
        .separation(function (a, b) { return (a.parent === b.parent ? 3 : 5); });
    },

    _addLinksToTree: function (treeLayout, nodes, gElement) {
      var diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.y, d.x]; });
      gElement.selectAll('link')
        .data(treeLayout.links(nodes))
        .enter().append('path')
        .attr('class', this._addScopeToClassName('link'))
        .attr('d', diagonal);
    },

    _drawNodes: function (nodes, gElement) {
      var self = this;
      var node = gElement.selectAll('node')
        .data(nodes)
        .enter().append('g')
        .attr('class', function (d) {
          return self._addScopeToClassName('node' + (d.children ? ' node--internal' : ' node--leaf'));
        })
        .attr('transform', function (d) {
          return 'translate(' + d.y + ',' + d.x + ')';
        })
        .on('mouseover', self.infoToolTip.show)
        .on('mouseout', self.infoToolTip.hide);
      node.append('circle')
        .attr('class', self.is)
        .attr('r', 2.5);
      this._drawNodesTexts(node);
    },

    _drawNodesTexts: function (nodes) {
      nodes.append('text')
        .attr('class', this.is)
        .attr('dy', -2)
        .attr('x', function (d) { return d.parent ? 6 : -6; })
        .style('text-anchor', function (d) { return d.parent ? 'start' : 'end'; })
        .text(function (d) {
          return d.data.webpackageId;
        });

      nodes.append('text')
        .attr('class', this.is)
        .attr('dy', 8)
        .attr('x', function (d) { return d.parent ? 6 : -6; })
        .style('text-anchor', function (d) { return d.parent ? 'start' : 'end'; })
        .text(function (d) {
          return '\\' + d.data.artifactId;
        });
    },

    _setCollapseShownListener: function (treeIndex, svgContainer, gElement) {
      var self = this;
      var panelId = this._generateTreeId(treeIndex);
      $('#' + panelId).on('shown.bs.collapse', function () {
        if (self._isValidScale(self.getScale()) && self.getScale() !== 'none') {
          self._scaleAndCenterTree(svgContainer, gElement, self.getScale());
        } else {
          self._scaleAndCenterTree(svgContainer, gElement, 'auto');
        }
        $('#' + panelId).off('shown.bs.collapse')
      });
    },

    _handleToggleCollapseIcons: function () {
      // Toggle plus minus icon on show hide of collapse element
      $('.collapse').on('show.bs.collapse', function(){
        $(this).parent().find(".glyphicon").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
      }).on('hide.bs.collapse', function(){
        $(this).parent().find(".glyphicon").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
      });
    },

    /**
     * Append a new tree to the svg
     * @param {object} treeRoot - Root node of the tree to be appened
     * @private
     */
    _appendTree: function (treeRoot, treeIndex) {
      this.status = 'init';
      var treeLayout = this._generateTreeLayout();
      var self = this;
      var treePanel = this._createTreePanel();
      this._addHeadingToTreePanel(treePanel, treeRoot.data, treeIndex);
      var bodyPanel = this._addCollapseBodyToTreePanel(treePanel, treeIndex);
      var svg = this._createSvgForTree(bodyPanel);
      var g = svg.append('g');
      var nodes = treeLayout.nodes(treeRoot);
      this._addLinksToTree(treeLayout, nodes, g);
      this._drawNodes(nodes, g);
      this._setCollapseShownListener(treeIndex, svg, g);
      this._handleToggleCollapseIcons();
      this.status = 'ready';
    },

    _addScopeToClassName: function (className) {
      return className + ' ' + this.is;
    },

    _generateTreeId: function (treeIndex) {
      return 'dep_tree_' + treeIndex;
    },

    /**
     * Scale and center the tree within the svg that contains it
     * @param {object} svg - D3 selection of the svg element
     * @param {object} g - D3 selection of the svg group (<g>) that wraps the tree
     * @param {number} scale - Scale ratio to be use when scaling the depTree
     * @returns {{x: number, y: number, scale: *}} - Final position and scale ratio
     * @private
     */
    _scaleAndCenterTree: function (svg, g, scale) {
      var svgSize;
      var gSize;
      if (scale === 'auto') {
        svgSize = {width: svg.node().parentNode.clientWidth, height: svg.node().parentNode.clientHeight};
        gSize = {width: g.node().getBBox().width, height: g.node().getBBox().height};
        scale = Math.min(svgSize.width / gSize.width, svgSize.height / gSize.height);
      }
      var newX = Math.abs(svgSize.width - gSize.width * scale) / 2 + Math.abs(g.node().getBBox().x) * scale;
      var newY = Math.abs(svgSize.height - gSize.height * scale) / 2 + Math.abs(g.node().getBBox().y) * scale;
      if (isNaN(scale) || isNaN(newX) || isNaN(newY)) {
        console.warn('Dimensions and position of the dependency tree(s) containers could not be ' +
          'calculated. The component should be attached to the DOM.');
        return;
      }
      g.transition()
        .attr('transform', 'translate(' + newX + ',' + newY + ') ' + 'scale(' + scale + ')');
      var transform = {x: newX, y: newY, scale: scale};
      this._setZoomBehaviorToSvg(svg, g, transform);
      return transform;
    },

    /**
     * Set the zoom behavior to the viewer and center the tree
     * @param {object} svg - D3 selection of the svg element
     * @param {object} g - D3 selection of the svg group (<g>) that wraps the tree
     * @param {object} currentTransform - Current transform of the video in the form
     * {x: newX, y: newY, scale: scale}
     * @private
     */
    _setZoomBehaviorToSvg: function (svg, g, currentTransform) {
      var zoom = d3.behavior.zoom()
        .translate([currentTransform.x, currentTransform.y])
        .scale(currentTransform.scale)
        .on('zoom', function () {
          g.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
        });
      svg.call(zoom);
    },

    /**
     * Allow the 'svg' to show a tooltip showing the 'message'
     * @param {object} svg - D3 selection of the svg element
     * @param {(function|string)} message - String containing the message to be shown or a function
     * returning the string
     * @private
     */
    _setTooltipCapabilityToSvg: function (svg, message) {
      // Tooltip
      this.infoToolTip = d3.tip()
        .attr('class', 'info_tooltip ' + this.is)
        .offset([ 30, 0 ])
        .html(message);
      this.infoToolTip.direction('e');

      svg.call(this.infoToolTip);
    }
  });
}());
