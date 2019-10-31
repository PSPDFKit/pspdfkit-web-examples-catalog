(function() {
  // The script that loads PSPDFKit does not get transpiled by Babel, so we can
  // not reference environment variables there directly.
  var PSPDFKIT_SERVER_URL_OR_PORT = getMeta("pspdfkit-server-url-or-port");

  var url =
    PSPDFKIT_SERVER_URL_OR_PORT.indexOf("/") > 0
      ? PSPDFKIT_SERVER_URL_OR_PORT
      : window.location.protocol +
        "//" +
        location.hostname +
        ":" +
        PSPDFKIT_SERVER_URL_OR_PORT;

  // We dynamically insert the script tag to load pspdfkit.js
  document.write('<script src="' + url + '/pspdfkit.js"></script>');

  function getMeta(name) {
    return document
      .querySelector('meta[name="' + name + '"]')
      .getAttribute("content");
  }
})();
