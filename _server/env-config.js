module.exports = {
  LIB_FILE: "pspdfkit.js",
  LICENSE_KEY: process.env.PSPDFKIT_STANDALONE_LICENSE_KEY,
  // The external URL is used by the browser to connect to PSPDFKit Document Engine. By
  // default, it uses the same host as the browser is currently serving and adds
  // port 5000 (the default PSPDFKit Document Engine port).
  //
  // In some situations, this URL needs to be manually overwritten. This is
  // usually the case when you want to deploy the Examples Catalog to production
  // and have a different hostname for the PSPDFKit Document Engine.
  PSPDFKIT_SERVER_EXTERNAL_URL_OR_PORT:
    process.env.PSPDFKIT_SERVER_EXTERNAL_URL || "5000",
  PSPDFKIT_LIB_SERVE_STRATEGY:
    process.env.PSPDFKIT_LIB_SERVE_STRATEGY || "static",
  PSPDFKIT_LIB_EXPLICIT_URL:
    process.env.PSPDFKIT_LIB_EXPLICIT_URL || "http://localhost:8080",
  PSPDFKIT_AIA_URL: process.env.PSPDFKIT_AIA_URL,
};
