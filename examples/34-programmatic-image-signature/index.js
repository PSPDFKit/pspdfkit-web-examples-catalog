import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  return PSPDFKit.load(defaultConfiguration).then(async (instance) => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    const annotations = await instance.getAnnotations(0);

    if (
      !annotations.find(
        (annotation) =>
          annotation.customData && annotation.customData.progrmmatic
      )
    ) {
      const blob = await fetch(
        "/programmatic-image-signature/static/jappleseed.png"
      ).then((res) => res.blob());
      const imageAttachmentId = await instance.createAttachment(blob);
      const imageSignature = new PSPDFKit.Annotations.ImageAnnotation({
        boundingBox: new PSPDFKit.Geometry.Rect({
          width: 300,
          height: 166,
          top: 562,
          left: 140,
        }),
        imageAttachmentId,
        isSignature: true,
        pageIndex: 0,
        contentType: "image/png",
        description: "John Appleseed",
        customData: {
          progrmmatic: true,
        },
      });

      instance.create(imageSignature);
    }

    return instance;
  });
}
