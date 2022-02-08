import PSPDFKit from "pspdfkit";
import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

export function load(defaultConfiguration) {
  // PSPDFKit freezes the Options object to prevent changes after the first load
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

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
