/* globals chrome */
(function () {
  var injectedScriptUrl = chrome.extension.getURL('js/injected_script.js');
  var injectedScript = document.querySelector('[src="' + injectedScriptUrl + '"]');
  var definitionsMsg;
  if (injectedScript) {
    document.body.removeChild(injectedScript);
  }

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = injectedScriptUrl;
  document.body.appendChild(script);

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
    definitionsMsg = message;
  });

  chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
      if (message.name === 'get-definitions') {
        sendResponse(definitionsMsg);
      }
    });
})();
