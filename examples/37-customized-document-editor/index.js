import PSPDFKit from "@nutrient-sdk/viewer";

import { flattenAnnotationsHandler } from "./static/index";

let instance;

export function load(defaultConfiguration) {
  const _toolbarItems = PSPDFKit.defaultDocumentEditorToolbarItems
    .filter(
      (item) =>
        item.type === "add" ||
        item.type === "remove" ||
        item.type === "duplicate"
    )
    .map((item) => {
      if (item.type === "add") {
        return { ...item, className: "add-page" };
      } else if (item.type === "remove") {
        return { ...item, className: "remove-page" };
      } else return item;
    });

  const customShowTotalPagesCountToolbarItem = {
    type: "custom",
    title: "Show total pages count",
    onPress: () => {
      alert(instance.totalPageCount);
    },
  };

  const additionalToolbarItems = [
    {
      type: "custom",
      title: "Flatten annotations",
      id: "flatten-annotations",
      onPress: (_, editorHandler) => {
        flattenAnnotationsHandler({
          instance,
          editorHandler,
          defaultConfiguration,
        });
      },
    },
  ];

  return PSPDFKit.load({
    ...defaultConfiguration,
    documentEditorToolbarItems: [
      ..._toolbarItems,
      customShowTotalPagesCountToolbarItem,
      { type: "spacer" },
      ...additionalToolbarItems,
    ],
    documentEditorFooterItems: PSPDFKit.defaultDocumentEditorFooterItems
      .filter((item) => item.type !== "save-as")
      .map((item) => {
        if (item.type === "cancel") return { ...item, className: "cancel" };

        return item;
      }),
    styleSheets: ["/customized-document-editor/static/styles.css"],
  }).then((_instance) => {
    instance = _instance;
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
}
