import PSPDFKit from "@nutrient-sdk/viewer";

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
  }).then(async (instance) => {
    // --- 1. Helvetica Bold multiline stamp (core-rendered) ---
    const helveticaStamp = new PSPDFKit.Annotations.StampAnnotation({
      pageIndex: 0,
      stampType: "Custom",
      title: "APPROVED\nQuality Control Dept.\n2026-03-20",
      boundingBox: new PSPDFKit.Geometry.Rect({
        left: 50,
        top: 50,
        width: 300,
        height: 80,
      }),
      multiline: true,
      font: "Helvetica",
      fontSize: 14,
      fontColor: new PSPDFKit.Color({ r: 0, g: 100, b: 0 }),
      isBold: true,
      isItalic: false,
      color: new PSPDFKit.Color({ r: 0, g: 100, b: 0 }),
    });

    // --- 2. Courier Bold+Italic multiline stamp (core-rendered, clearly different font) ---
    const courierStamp = new PSPDFKit.Annotations.StampAnnotation({
      pageIndex: 0,
      stampType: "Custom",
      title: "CONFIDENTIAL\nFor Internal Use Only",
      boundingBox: new PSPDFKit.Geometry.Rect({
        left: 50,
        top: 150,
        width: 300,
        height: 60,
      }),
      multiline: true,
      font: "Courier",
      fontSize: 13,
      fontColor: new PSPDFKit.Color({ r: 180, g: 0, b: 0 }),
      isBold: true,
      isItalic: true,
      color: new PSPDFKit.Color({ r: 180, g: 0, b: 0 }),
    });

    // --- 3. Image + multiline composite stamp (core-rendered) ---
    // Create a small PNG image to embed in the stamp.
    const iconCanvas = document.createElement("canvas");
    iconCanvas.width = 128;
    iconCanvas.height = 128;
    const iconCtx = iconCanvas.getContext("2d");
    // Draw a green checkmark circle
    iconCtx.beginPath();
    iconCtx.arc(64, 64, 56, 0, Math.PI * 2);
    iconCtx.fillStyle = "#4CAF50";
    iconCtx.fill();
    iconCtx.strokeStyle = "#2E7D32";
    iconCtx.lineWidth = 6;
    iconCtx.stroke();
    iconCtx.beginPath();
    iconCtx.moveTo(40, 68);
    iconCtx.lineTo(56, 84);
    iconCtx.lineTo(88, 44);
    iconCtx.strokeStyle = "white";
    iconCtx.lineWidth = 10;
    iconCtx.lineCap = "round";
    iconCtx.lineJoin = "round";
    iconCtx.stroke();

    const iconBlob = await new Promise((resolve) =>
      iconCanvas.toBlob((blob) => resolve(blob), "image/png"),
    );
    const iconFile = new File([iconBlob], "checkmark.png", {
      type: "image/png",
    });
    const imageAttachmentId = await instance.createAttachment(iconFile);

    const imageRichStamp = new PSPDFKit.Annotations.StampAnnotation({
      pageIndex: 0,
      stampType: "Custom",
      title: "VERIFIED\nDocument Check Passed\nInspector: J. Smith",
      boundingBox: new PSPDFKit.Geometry.Rect({
        left: 50,
        top: 230,
        width: 340,
        height: 80,
      }),
      multiline: true,
      font: "Helvetica",
      fontSize: 12,
      fontColor: new PSPDFKit.Color({ r: 26, g: 35, b: 126 }),
      isBold: true,
      isItalic: false,
      color: new PSPDFKit.Color({ r: 57, g: 73, b: 171 }),
      imageAttachmentId,
      imageContentType: "image/png",
    });

    // --- 4. Image between text lines (vertical layout) ---
    const verticalImageStamp = new PSPDFKit.Annotations.StampAnnotation({
      pageIndex: 0,
      stampType: "Custom",
      title: "Approved\n20.03.2026",
      boundingBox: new PSPDFKit.Geometry.Rect({
        left: 50,
        top: 330,
        width: 200,
        height: 120,
      }),
      multiline: true,
      font: "Helvetica",
      fontSize: 12,
      fontColor: new PSPDFKit.Color({ r: 0, g: 100, b: 0 }),
      isBold: true,
      color: new PSPDFKit.Color({ r: 0, g: 100, b: 0 }),
      imageAttachmentId,
      imageContentType: "image/png",
      imagePosition: { row: 1, align: "center" },
    });

    // --- 5. Image at top (row 0) ---
    const imageTopStamp = new PSPDFKit.Annotations.StampAnnotation({
      pageIndex: 0,
      stampType: "Custom",
      title: "Quality Check\nPassed",
      boundingBox: new PSPDFKit.Geometry.Rect({
        left: 270,
        top: 330,
        width: 200,
        height: 120,
      }),
      multiline: true,
      font: "Helvetica",
      fontSize: 12,
      fontColor: new PSPDFKit.Color({ r: 0, g: 0, b: 128 }),
      isBold: true,
      color: new PSPDFKit.Color({ r: 0, g: 0, b: 128 }),
      imageAttachmentId,
      imageContentType: "image/png",
      imagePosition: { row: 0, align: "left" },
    });

    // --- 6. Image at bottom (row 2) ---
    const imageBottomStamp = new PSPDFKit.Annotations.StampAnnotation({
      pageIndex: 0,
      stampType: "Custom",
      title: "Reviewed By\nJ. Smith",
      boundingBox: new PSPDFKit.Geometry.Rect({
        left: 50,
        top: 470,
        width: 200,
        height: 120,
      }),
      multiline: true,
      font: "Courier",
      fontSize: 11,
      fontColor: new PSPDFKit.Color({ r: 128, g: 0, b: 0 }),
      isBold: true,
      color: new PSPDFKit.Color({ r: 128, g: 0, b: 0 }),
      imageAttachmentId,
      imageContentType: "image/png",
      imagePosition: { row: 2, align: "right" },
    });

    // --- 7. 5-line stamp with image at row 2 (middle) ---
    const fiveLineMiddle = new PSPDFKit.Annotations.StampAnnotation({
      pageIndex: 0,
      stampType: "Custom",
      title: "DEPARTMENT\nEngineering\nStatus: Active\nDate: 01.04.2026\nRef: DOC-4521",
      boundingBox: new PSPDFKit.Geometry.Rect({
        left: 50,
        top: 610,
        width: 250,
        height: 160,
      }),
      multiline: true,
      font: "Helvetica",
      fontSize: 10,
      fontColor: new PSPDFKit.Color({ r: 50, g: 50, b: 50 }),
      isBold: true,
      color: new PSPDFKit.Color({ r: 100, g: 100, b: 100 }),
      imageAttachmentId,
      imageContentType: "image/png",
      imagePosition: { row: 2, align: "center" },
    });

    // --- 8. 5-line stamp with image at row 4 (near bottom) ---
    const fiveLineNearBottom = new PSPDFKit.Annotations.StampAnnotation({
      pageIndex: 0,
      stampType: "Custom",
      title: "INVOICE\nCompany: Acme Corp\nAmount: $1,250.00\nDue: 15.04.2026\nPaid",
      boundingBox: new PSPDFKit.Geometry.Rect({
        left: 320,
        top: 610,
        width: 250,
        height: 160,
      }),
      multiline: true,
      font: "Courier",
      fontSize: 9,
      fontColor: new PSPDFKit.Color({ r: 0, g: 80, b: 0 }),
      isBold: true,
      color: new PSPDFKit.Color({ r: 0, g: 120, b: 0 }),
      imageAttachmentId,
      imageContentType: "image/png",
      imagePosition: { row: 4, align: "left" },
    });

    // --- 9. Standard stamp ---
    const standardStamp = new PSPDFKit.Annotations.StampAnnotation({
      pageIndex: 0,
      stampType: "Approved",
      boundingBox: new PSPDFKit.Geometry.Rect({
        left: 270,
        top: 470,
        width: 200,
        height: 50,
      }),
    });

    await instance.create([
      helveticaStamp,
      courierStamp,
      imageRichStamp,
      verticalImageStamp,
      imageTopStamp,
      imageBottomStamp,
      fiveLineMiddle,
      fiveLineNearBottom,
      standardStamp,
    ]);

    return instance;
  });
}
