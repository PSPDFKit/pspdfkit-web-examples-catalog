import PSPDFKit from "@nutrient-sdk/viewer";

import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

export function load(defaultConfiguration) {
  // Nutrient Web SDK freezes the Options object to prevent changes after the first load
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: PSPDFKit.defaultToolbarItems,
  }).then(async (instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    // Create Text & Stamp Annotations that support the noZoom flag
    await instance.create([
      new PSPDFKit.Annotations.TextAnnotation({
        pageIndex: 0,
        boundingBox: new PSPDFKit.Geometry.Rect({
          left: 50,
          top: 150,
          width: 180,
          height: 25,
        }),
        text: {
          format: "plain",
          value: "Text with noZoom flag",
        },
        noZoom: true,
      }),
      new PSPDFKit.Annotations.TextAnnotation({
        pageIndex: 0,
        boundingBox: new PSPDFKit.Geometry.Rect({
          left: 300,
          top: 150,
          width: 201,
          height: 25,
        }),
        text: {
          format: "plain",
          value: "Standard Text Annotation",
        },
        noZoom: false,
      }),
      new PSPDFKit.Annotations.StampAnnotation({
        pageIndex: 0,
        title: "Stamp with noZoom flag",
        boundingBox: new PSPDFKit.Geometry.Rect({
          left: 50,
          top: 200,
          width: 240,
          height: 80,
        }),
        noZoom: true,
      }),
      new PSPDFKit.Annotations.StampAnnotation({
        pageIndex: 0,
        title: "Standard Stamp Annotation",
        boundingBox: new PSPDFKit.Geometry.Rect({
          left: 300,
          top: 200,
          width: 240,
          height: 80,
        }),
        noZoom: false,
      }),
    ]);

    return instance;
  });
}
