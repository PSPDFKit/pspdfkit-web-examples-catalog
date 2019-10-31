import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: [],
    // Use the PDF export mode for the default print button.
    printMode: PSPDFKit.PrintMode.EXPORT_PDF
  }).then(instance => {
    instance.setToolbarItems([
      // Default print button
      {
        type: "print"
      },
      {
        type: "custom",
        title: "Print as HTML (default)",
        onPress: () => {
          // Pre-renders all pages of the document in the DOM. Great browser support but not ideal for large PDFs.
          // This is the default printing mode.
          instance.print(PSPDFKit.PrintMode.DOM);
        }
      },
      {
        type: "custom",
        title: "Print an exported PDF",
        onPress: () => {
          // Print an exported PDF in the native PDF reader. This approach works for PDFs of all sizes, but browser support varies.
          // For details, check out https://pspdfkit.com/guides/web/current/features/printing/#pspdfkit-printmode-export_pdf
          instance.print(PSPDFKit.PrintMode.EXPORT_PDF);
        }
      }
    ]);

    return instance;
  });
}
