module.exports = {
  LICENSE_KEY: process.env.PSPDFKIT_STANDALONE_LICENSE_KEY,
  // The external URL is used by the browser to connect to PSPDFKit Server. By
  // default, it uses the same host as the browser is currently serving and adds
  // port 5000 (the default PSPDFKit Server port).
  //
  // In some situations, this URL needs to be manually overwritten. This is
  // usually the case when you want to deploy the Examples Catalog to production
  // and have a different hostname for the PSPDFKit Server.
  PSPDFKIT_SERVER_EXTERNAL_URL_OR_PORT:
    process.env.PSPDFKIT_SERVER_EXTERNAL_URL || "5000"
};
