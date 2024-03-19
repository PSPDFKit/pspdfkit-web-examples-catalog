import PSPDFKit from "pspdfkit";

import { importImagesHandler, importOfficeHandler } from "./static/index";

let _instance;

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
      alert(_instance.totalPageCount);
    },
  };

  const additionalToolbarItems = [
    {
      type: "custom",
      title: "Import images",
      id: "import-images",
      onPress: (_, editorHandler) => {
        importImagesHandler({
          instance,
          editorHandler,
          defaultConfiguration,
        });
      },
    },
    {
      type: "custom",
      title: "Import Office files",
      id: "import-office",
      onPress: (_, editorHandler) => {
        importOfficeHandler({
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
  }).then((instance) => {
    _instance = instance;
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    return instance;
  });
}
