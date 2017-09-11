/* globals chrome */
(function () {
  window.setSelectedElement = function (e) {
    dispatchGetInfoEvent({name: 'get-slots-info', content: e.getAttribute('runtime-id') || ''});
  };
  var injectedScriptId = 'chrome-webinspector-script';
  var injectedScript = document.querySelector('#' + injectedScriptId);
  if (!injectedScript) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = chrome.extension.getURL('js/injected_script.js');
    script.setAttribute('id', injectedScriptId);
    document.body.appendChild(script);
  }

  window.addEventListener('message', function (event) {
    // Only accept messages from the same frame
    if (event.source !== window) {
      return;
    }

    var message = event.data;

    // Only accept messages that we know are ours
    if (typeof message !== 'object' || message === null ||
      message.source !== 'cubbles-webinspector') {
      return;
    }
    chrome.runtime.sendMessage(message);
  });

  /**
   * Dispatch 'componentAppend' event so that the CRC starts working
   */
  function dispatchGetInfoEvent (message) {
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('getInfo', true, true, message);
    document.dispatchEvent(event);
  }

  chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
      dispatchGetInfoEvent(message);
      sendResponse({name: 'processing'});
    });
})();
