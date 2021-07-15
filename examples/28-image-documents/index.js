import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  const toolbarItems = [
    { type: "zoom-out" },
    { type: "zoom-in" },
    { type: "marquee-zoom" },
    { type: "pan" },
    { type: "spacer" },
    { type: "ink" },
    { type: "text" },
    { type: "stamp" },
    { type: "note" },
    { type: "arrow" },
    { type: "line" },
    { type: "rectangle" },
    { type: "ellipse" },
    { type: "polygon" },
    { type: "polyline" },
    { type: "spacer" },
    { type: "export-pdf" },
    { type: "print" },
  ];

  // Enable comments on Server with Instant.
  if (defaultConfiguration.documentId && defaultConfiguration.instant) {
    toolbarItems.splice(9, 0, { type: "comment" });
  }

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems,
  }).then((instance) => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    return instance;
  });
}
