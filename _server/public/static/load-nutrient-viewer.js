(function () {
  // The script that loads Nutrient Web SDK does not get transpiled by Babel, so we can
  // not reference environment variables there directly.

  var LIB_FILE = getMeta("web-sdk-lib-file");

  // We dynamically insert the script tag to load nutrient-viewer.js
  document.write(
    '<script src="' +
      resolveNutrientLibBaseUrl() +
      "/" +
      LIB_FILE +
      '"></script>'
  );

  function resolveNutrientLibBaseUrl() {
    var serveStrategy = getMeta("web-sdk-lib-serve-strategy");

    switch (serveStrategy) {
      case "static":
        // Serving Web SDK from a bundle in the static directory.
        return "/static/sdk";
      case "server":
        // Serving Web SDK from Document Engine. This is deprecated and might get removed in the future.
        return resolveServerUrl();
      case "webpack":
        // Serving Web SDK from server URL; this is usually local Webpack, so localhost, but
        // can be an external URL as well.
        return `${window.location.protocol}//${window.location.hostname}:8080`;
      case "explicitUrl":
        // Serving Web SDK from preconfigured URL
        return getMeta("web-sdk-lib-explicit-url");
      default:
        throw new Error(
          "Invalid value for web-sdk-lib-serve-strategy: " + serveStrategy
        );
    }
  }

  function resolveServerUrl() {
    var DOCUMENT_ENGINE_URL_OR_PORT = getMeta("document-engine-url-or-port");

    return DOCUMENT_ENGINE_URL_OR_PORT.indexOf("/") > 0
      ? DOCUMENT_ENGINE_URL_OR_PORT
      : window.location.protocol +
          "//" +
          location.hostname +
          ":" +
          DOCUMENT_ENGINE_URL_OR_PORT;
  }

  function getMeta(name) {
    return document
      .querySelector('meta[name="' + name + '"]')
      .getAttribute("content");
  }
})();
