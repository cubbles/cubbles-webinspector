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
    is: 'cubx-root-deps-to-dep-trees',

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
     *  Observe the Cubbles-Component-Model: If value for slot 'a' has changed ...
     */
    modelRootDependenciesChanged: function (rootDependencies) {
      this._depTreesOf(rootDependencies, function (depTrees) {
        this.setDepTrees(depTrees);
      }.bind(this));
    },

    /**
     * Build the dep trees of a set of rootDependencies
     * @param {object} rootDependencies - Root dependencies
     * @param {function} callback - Function to be called when the depTree is ready
     * @private
     */
    _depTreesOf: function (rootDependencies, callback) {
      var depMgr = window.cubx.CRC.getDependencyMgr();
      // Create list of DepReference items from given rootDependencies
      var deps = depMgr._createDepReferenceListFromArtifactDependencies(rootDependencies, null);

      // Finally build rawDependency tree providing DepReference list and baseUrl
      depMgr._buildRawDependencyTree(deps, this.getBaseUrl() || window.cubx.CRC._baseUrl)
        .then(function (depTree) {
          callback(depTree);
        });
    }
  });
}());
