import PSPDFKit from "@nutrient-sdk/viewer";

import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

let instance = null;
let wordLevel = true;

export function load(defaultConfiguration) {
  // Nutrient Web SDK freezes the Options object to prevent changes after the first load.
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  const createDiffModeToggle = () => {
    return {
      type: "custom",
      id: "diff-mode-toggle",
      title: wordLevel ? "Show character changes" : "Show word changes",
      onPress: () => {
        wordLevel = !wordLevel;

        // Create updated toolbar items with new toggle state.
        const toolbarItems = [
          ...PSPDFKit.defaultTextComparisonToolbarItems,
          createDiffModeToggle(),
        ];

        // Reload text comparison with new word level setting.
        PSPDFKit.unload(defaultConfiguration.container);

        // Clear the container manually to ensure it's empty.
        const container =
          typeof defaultConfiguration.container === "string"
            ? document.querySelector(defaultConfiguration.container)
            : defaultConfiguration.container;

        if (container) {
          container.innerHTML = "";
        }

        // Small delay to ensure unload is complete.
        setTimeout(() => {
          PSPDFKit.loadTextComparison({
            ...defaultConfiguration,
            documentA: "text-comparison/static/documentA.pdf",
            documentB: "text-comparison/static/documentB.pdf",
            toolbarItems,
            ai: true,
            wordLevel,
          }).then((_instance) => {
            instance = _instance;
            console.log(
              `AI Text Comparison reloaded with ${
                wordLevel ? "word" : "character"
              }-level diff`
            );
          });
        }, 100);
      },
    };
  };

  const toolbarItems = [
    ...PSPDFKit.defaultTextComparisonToolbarItems,
    createDiffModeToggle(),
  ];

  return PSPDFKit.loadTextComparison({
    ...defaultConfiguration,
    documentA: "text-comparison/static/documentA.pdf",
    documentB: "text-comparison/static/documentB.pdf",
    toolbarItems,
    ai: true,
    wordLevel: true,
  }).then((_instance) => {
    console.log(
      "AI Text Comparison UI for Web successfully loaded!!",
      _instance
    );
    instance = _instance;

    return instance;
  });
}
