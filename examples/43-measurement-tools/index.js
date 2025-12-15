import PSPDFKit from "@nutrient-sdk/viewer";

export function load(defaultConfiguration) {
  PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: [...PSPDFKit.defaultToolbarItems, { type: "measure" }],
  }).then((instance) => {
    window.instance = instance;
  });
}
