import PSPDFKit from "pspdfkit";

import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

export function load(defaultConfiguration) {
  if (!defaultConfiguration.document) {
    alert("Custom Fonts is not available on Server backed setup.");

    return;
  }

  // PSPDFKit freezes the Options object to prevent changes after the first load
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
        return acc.concat([
          item,
          { type: "undo" },
          { type: "redo" },
          { type: "form-creator" },
        ]);
      }

      return acc.concat([item]);
    }, []),
    customFonts: [
      new PSPDFKit.Font({
        name: "SourceHanSerif.ttf",
        callback: (name) =>
          fetch(`/custom-fonts/static/${name}`).then((resp) => resp.blob()),
      }),
    ],
  }).then((instance) => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    return instance;
  });
}
