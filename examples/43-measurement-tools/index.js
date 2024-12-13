import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: [...PSPDFKit.defaultToolbarItems, { type: "measure" }],
  }).then((instance) => {
    window.instance = instance;
  });
}
