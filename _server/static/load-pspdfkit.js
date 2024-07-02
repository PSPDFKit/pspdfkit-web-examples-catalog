(function () {
  // The script that loads PSPDFKit does not get transpiled by Babel, so we can
  // not reference environment variables there directly.

  var LIB_FILE = getMeta("pspdfkit-lib-file");

  // We dynamically insert the script tag to load pspdfkit.js
  document.write(
    '<script src="' +
      resolvePspdfkitLibBaseUrl() +
      "/" +
      LIB_FILE +
      '"></script>'
  );

  function resolvePspdfkitLibBaseUrl() {
    var serveStrategy = getMeta("pspdfkit-lib-serve-strategy");

    switch (serveStrategy) {
      case "static":
        // Serving Web SDK from a bundle in the static directory.
        return "/static/sdk";
      case "server":
        // Serving Web SDK from Document Engine or PSPDFKit Server. This is deprecated and might get removed in the future.
        return resolveServerUrl();
      case "webpack":
        // Serving Web SDK from server URL; this is usually local Webpack, so localhost, but
        // can be an external URL as well.
        return `${window.location.protocol}//${window.location.hostname}:8080`;
      case "explicitUrl":
        // Serving Web SDK from preconfigured URL
        return getMeta("pspdfkit-lib-explicit-url");  
      default:
        throw new Error(
          "Invalid value for pspdfkit-lib-serve-strategy: " + serveStrategy
        );
    }
  }

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
