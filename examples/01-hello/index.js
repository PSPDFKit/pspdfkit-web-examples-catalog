import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    enableHistory: true,
    toolbarItems: defaultConfiguration.toolbarItems.reduce((acc, item) => {
      if (item.type === "polyline") {
        return acc.concat([item, { type: "undo" }, { type: "redo" }]);
      }

      return acc.concat([item]);
    }, []),
  }).then((instance) => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    return instance;
  });
}
