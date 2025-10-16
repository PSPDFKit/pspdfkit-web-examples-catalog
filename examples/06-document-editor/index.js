import PSPDFKit from "@nutrient-sdk/viewer";

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    documentEditorConfiguration: {
      thumbnailMinSize: 50,
      thumbnailMaxSize: 5000,
      thumbnailDefaultSize: 400,
    },
  }).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
}
