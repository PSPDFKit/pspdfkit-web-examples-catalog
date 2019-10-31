let PSPDFKit = null;
if (typeof window !== "undefined") {
  if (!window.PSPDFKit) {
    throw new Error(
      "PSPDFKit was not successfully initialized. " +
        "We load the main entry point (pspdfkit.js) from PSPDFKit Server. " +
        "Please make sure the Server is properly running."
    );
  }

  PSPDFKit = window.PSPDFKit;
  // Always enable JavaScript.
  PSPDFKit.Options.PDF_JAVASCRIPT = true;
}

export default PSPDFKit;
