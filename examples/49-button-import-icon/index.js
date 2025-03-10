import PSPDFKit from "@nutrient-sdk/viewer";

import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

export function load(defaultConfiguration) {
  if (!defaultConfiguration.document) {
    alert("Button import icon is not available on Server backed setup.");

    return;
  }

  // Nutrient Web SDK freezes the Options object to prevent changes after the first load
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  // PSPDFKit.Configuration#authPayload is a Server only property.
  // We check for its presence to determine if content-editor should be added
  const items = defaultConfiguration.toolbarItems.concat(
    defaultConfiguration.authPayload ? [] : [{ type: "content-editor" }]
  );

  return PSPDFKit.load({
    ...defaultConfiguration,
    enableHistory: true,
    toolbarItems: items.reduce((acc, item) => {
      if (item.type === "polyline") {
        return acc.concat([item, { type: "undo" }, { type: "redo" }]);
      }

      return acc.concat([item]);
    }, []),
  }).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
}
