import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    documentEditorConfiguration: {
      thumbnailMinSize: 50,
      thumbnailMaxSize: 5000,
      thumbnailDefaultSize: 400,
    },
  }).then((instance) => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    return instance;
  });
}
