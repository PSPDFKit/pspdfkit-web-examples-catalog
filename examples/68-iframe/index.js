import PSPDFKit from "@nutrient-sdk/viewer";

import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

export function load(defaultConfiguration) {
  // Nutrient Web SDK freezes the Options object to prevent changes after the first load
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  const items = defaultConfiguration.toolbarItems.concat([
    { type: "content-editor" },
  ]);

  return PSPDFKit.load({
    ...defaultConfiguration,
    enableHistory: true,
    useIframe: true,
    toolbarItems: items
      .reduce((acc, item) => {
        if (item.type === "polyline") {
          return acc.concat([item, { type: "undo" }, { type: "redo" }]);
        }

        if (item.type === "zoom-mode") {
          return acc.concat([
            item,
            { type: "undo", dropdownGroup: "history" },
            { type: "redo", dropdownGroup: "history" },
          ]);
        }

        return acc.concat([item]);
      }, [])
      .concat([
        { type: "cloudy-rectangle", dropdownGroup: "shapes" },
        { type: "dashed-rectangle", dropdownGroup: "shapes" },
        { type: "cloudy-ellipse", dropdownGroup: "shapes" },
        { type: "dashed-ellipse", dropdownGroup: "shapes" },
        { type: "dashed-polygon", dropdownGroup: "shapes" },
        { type: "content-editor", dropdownGroup: "editor" },
        { type: "form-creator", dropdownGroup: "editor" },
        { type: "measure", dropdownGroup: "editor" },
        { type: "document-comparison", dropdownGroup: "editor" },
      ]),
  }).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
}
