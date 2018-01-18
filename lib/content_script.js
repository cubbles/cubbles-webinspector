/* globals chrome */
(function () {
  if (window.setSelectedElement) {
    return;
  }
  window.setSelectedElement = function (e) {
    dispatchGetSelectedComponent(e);

  };
  window.getSlotsInfo = function (e) {
    dispatchGetSlotsInfoEvent(e);
  };
  var injectedScriptId = 'chrome-webinspector-script';
  var injectedScript = document.querySelector('#' + injectedScriptId);
  if (!injectedScript) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = chrome.extension.getURL('lib/injected_script.js');
    script.setAttribute('id', injectedScriptId);
    document.body.appendChild(script);
  }

  window.addEventListener('message', handleMessages);

  function handleMessages (event) {
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
    sendMessageToBackgroundScript(message);
  }

  function dispatchGetSelectedComponent(e) {
    dispatchGetInfoEvent({
      name: 'get-selected-component',
      content: e.getAttribute('member-id') || 'no-cubbles'
    });
  }

  function dispatchGetSlotsInfoEvent(e) {
    dispatchGetInfoEvent({name: 'get-slots-info', content: e.getAttribute('runtime-id') || 'no-cubbles'});
  }

  /**
   * Dispatch 'componentAppend' event so that the CRC starts working
   */
  function dispatchGetInfoEvent (message) {
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('getInfo', true, true, message);
    document.dispatchEvent(event);
  }

  /**
   * Send a message to the background script
   * @param {{name: , content: }} message - Message to be sent
   */
  function sendMessageToBackgroundScript (message) {
    try {
      chrome.runtime.sendMessage(message);
    } catch (e) {
      console.warn('Connection to background script could not be established');
    }
  }

  chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
      dispatchGetInfoEvent(message);
      sendResponse({name: 'processing'});
    });
})();
