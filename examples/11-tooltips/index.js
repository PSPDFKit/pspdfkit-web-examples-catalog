import PSPDFKit from "pspdfkit";

// Keep track of the current instance so that we
// can use it inside the annotation tooltip callback.
let instance = null;

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    annotationTooltipCallback: duplicateAnnotationTooltipCallback,
  }).then((_instance) => {
    instance = _instance;

    return instance;
  });
}

function duplicateAnnotationTooltipCallback(annotation) {
  // Duplicating does not make sense for a markup annotation
  if (annotation instanceof PSPDFKit.Annotations.MarkupAnnotation) {
    return [];
  }

  // This is the tooltip item that will be used.
  const duplicateItem = {
    type: "custom",
    title: "Duplicate",
    id: "tooltip-duplicate-annotation",
    className: "TooltipItem-Duplication",
    onPress: async () => {
      // For the new annotation, we will copy the current one but
      // translate the annotation for 50px so that our users see the
      // duplicated annotation.
      const offset = 50;
      const offsetTranslation = new PSPDFKit.Geometry.Point({
        x: offset,
        y: offset,
      });

      const newBoundingBox =
        annotation.boundingBox.translate(offsetTranslation);

      // To make duplication work, we also need to remove the ID
      // of the annotation.
      let duplicatedAnnotation = annotation
        .set("id", null)
        .set("boundingBox", newBoundingBox);

      // When it's an InkAnnotation, we not only need to move the bounding box
      // but also change the coordinates of the line. Since an ink annotation
      // could contain of multiple segments, we need go change each segment.
      // You can read more about the structure of InkAnnotations here:
      // https://pspdfkit.com/api/web/PSPDFKit.Annotations.InkAnnotation.html
      if (duplicatedAnnotation instanceof PSPDFKit.Annotations.InkAnnotation) {
        duplicatedAnnotation = duplicatedAnnotation.set(
          "lines",
          duplicatedAnnotation.lines.map((line) => {
            return line.map((point) => point.translate(offsetTranslation));
          })
        );
      }

      // For some shape annotations, we may not only need to move the bounding box
      // but also change the coordinates of the shape, defined by the `startPoint`
      // and `endPoint` properties for line, and `points` for polyline and
      // polygon annotations, as well as `cloudyBorderInset` for annotations
      // with a cloudy border set.
      // You can read more about the structure of shape annotations here:
      // https://pspdfkit.com/api/web/PSPDFKit.Annotations.LineAnnotation.html
      // https://pspdfkit.com/api/web/PSPDFKit.Annotations.PolylineAnnotation.html
      // https://pspdfkit.com/api/web/PSPDFKit.Annotations.PolygonAnnotation.html
      if (duplicatedAnnotation instanceof PSPDFKit.Annotations.LineAnnotation) {
        duplicatedAnnotation = duplicatedAnnotation
          .set(
            "startPoint",
            duplicatedAnnotation.startPoint.translate(offsetTranslation)
          )
          .set(
            "endPoint",
            duplicatedAnnotation.endPoint.translate(offsetTranslation)
          );
      }

      if (
        duplicatedAnnotation instanceof
          PSPDFKit.Annotations.PolygonAnnotation ||
        duplicatedAnnotation instanceof PSPDFKit.Annotations.PolylineAnnotation
      ) {
        duplicatedAnnotation = duplicatedAnnotation.set(
          "points",
          duplicatedAnnotation.points.map((point) =>
            point.translate(offsetTranslation)
          )
        );
      }

      // In the end, we just use `createAnnotation` on our
      // PSPDFKit instance.
      await instance.create(duplicatedAnnotation);
    },
  };

  return [duplicateItem];
}
