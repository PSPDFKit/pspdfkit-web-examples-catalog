import PSPDFKit from "pspdfkit";

import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

export function load(defaultConfiguration) {
  // PSPDFKit freezes the Options object to prevent changes after the first load
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  return PSPDFKit.loadTextComparison({
    ...defaultConfiguration,
    documentA: "text-comparison/static/documentA.pdf",
    documentB: "text-comparison/static/documentB.pdf",
    toolbarItems: PSPDFKit.defaultTextComparisonToolbarItems,
  }).then((instance) => {
    console.log("Text Comparison UI for Web successfully loaded!!", instance);

    return instance;
  });
}
