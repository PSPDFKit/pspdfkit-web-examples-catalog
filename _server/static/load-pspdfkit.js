(function () {
  // The script that loads PSPDFKit does not get transpiled by Babel, so we can
  // not reference environment variables there directly.

  var serveStrategy = getMeta("pspdfkit-lib-serve-strategy");

  var url = serveStrategy == "static" ? "/static/sdk" : resolveServerUrl();

  var LIB_FILE = getMeta("pspdfkit-lib-file");

  // We dynamically insert the script tag to load pspdfkit.js
  document.write('<script src="' + url + "/" + LIB_FILE + '"></script>');

  function resolveServerUrl() {
    var PSPDFKIT_SERVER_URL_OR_PORT = getMeta("pspdfkit-server-url-or-port");

    return PSPDFKIT_SERVER_URL_OR_PORT.indexOf("/") > 0
      ? PSPDFKIT_SERVER_URL_OR_PORT
      : window.location.protocol +
          "//" +
          location.hostname +
          ":" +
          PSPDFKIT_SERVER_URL_OR_PORT;
  }

  function getMeta(name) {
    return document
      .querySelector('meta[name="' + name + '"]')
      .getAttribute("content");
  }
})();
