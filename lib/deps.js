window.cubx = {
  CRCInit: {
    rootDependencies: [
      {
        webpackageId: 'cubx-generic-component-viewer@1.4.0',
        artifactId: 'cubx-generic-component-viewer'
      },
      {
        webpackageId: 'dep-tree-viewer@1.3.2',
        artifactId: 'cubx-dep-tree-viewer'
      }
    ],
    rootDependencyExcludes: [
      {
        webpackageId: 'jquery-2.1.4@1.2.0',
        artifactId: 'jquery'
      }
  ]  
  }
};
