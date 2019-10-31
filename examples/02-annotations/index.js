import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  // You can find an introductions to annotations in our guides:
  // https://pspdfkit.com/guides/web/current/annotations/introduction-to-annotations/
  return PSPDFKit.load(defaultConfiguration).then(async instance => {
    // Add event listeners for annotion changes
    instance.addEventListener("annotations.load", loadedAnnotations => {
      console.log("Annotations were loaded", loadedAnnotations.toJS());
    });
    instance.addEventListener("annotations.change", function() {
      console.log("Something in the annotations has changed.");
    });
    instance.addEventListener("annotations.create", function(
      createdAnnotations
    ) {
      console.log("New annotations got created", createdAnnotations.toJS());
    });
    instance.addEventListener("annotations.update", function(
      updatedAnnotations
    ) {
      console.log("Annotations got updated", updatedAnnotations.toJS());
    });
    instance.addEventListener("annotations.delete", function(
      deletedAnnotations
    ) {
      console.log("Annotations got deleted", deletedAnnotations.toJS());
    });

    const annotationsOnFirstPage = await instance.getAnnotations(0);

    // For this example we only want to generate the annotations once. Therefore
    // we check if we already have annotations on our Page and if it's the case,
    // don't create them again. Since there is already one annotation within the
    // PDF on the first page, we check if there is less than once annotation.
    if (annotationsOnFirstPage.size <= 1) {
      // Creating a few annotations
      addAnnotationToDocument(instance, newInkAnnotation());
      addAnnotationToDocument(instance, newTextAnnotation());
      addAnnotationToDocument(instance, newEllipseAnnotationAnnotation());
      addAnnotationToDocument(instance, newHighlightAnnotation());
      addAnnotationToDocument(instance, newNoteAnnotation());
    }

    return instance;
  });
}

function addAnnotationToDocument(instance, annotation) {
  instance
    .createAnnotation(annotation)
    .then(instance.ensureAnnotationSaved)
    .then(function(savedAnnotation) {
      console.log("Saved annotation with the ID", savedAnnotation.id);
    });
}

// Ink annotation with three lines on the second page
function newInkAnnotation() {
  return new PSPDFKit.Annotations.InkAnnotation({
    pageIndex: 1,
    boundingBox: new PSPDFKit.Geometry.Rect({
      width: 150,
      height: 50,
      top: 50,
      left: 50
    }),
    strokeColor: PSPDFKit.Color.WHITE,
    lines: PSPDFKit.Immutable.List([
      PSPDFKit.Immutable.List([
        new PSPDFKit.Geometry.DrawingPoint({ x: 50, y: 50 }),
        new PSPDFKit.Geometry.DrawingPoint({ x: 200, y: 50 })
      ]),
      PSPDFKit.Immutable.List([
        new PSPDFKit.Geometry.DrawingPoint({ x: 50, y: 75 }),
        new PSPDFKit.Geometry.DrawingPoint({ x: 200, y: 75 })
      ]),
      PSPDFKit.Immutable.List([
        new PSPDFKit.Geometry.DrawingPoint({ x: 50, y: 100 }),
        new PSPDFKit.Geometry.DrawingPoint({ x: 200, y: 100 })
      ])
    ])
  });
}

// Creates a text annotation on the first page that says "Welcome to PSPDFKit"
function newTextAnnotation() {
  return new PSPDFKit.Annotations.TextAnnotation({
    pageIndex: 0,
    boundingBox: new PSPDFKit.Geometry.Rect({
      width: 150,
      height: 150,
      top: 50,
      left: 50
    }),
    text: "Welcome to\nPSPDFKit",
    font: "Helvetica",
    isBold: true,
    horizontalAlign: "center",
    verticalAlign: "center",
    backgroundColor: PSPDFKit.Color.BLUE,
    fontColor: PSPDFKit.Color.WHITE
  });
}

// Creates an ellipse annotation on the first page
function newEllipseAnnotationAnnotation() {
  return new PSPDFKit.Annotations.EllipseAnnotation({
    pageIndex: 0,
    boundingBox: new PSPDFKit.Geometry.Rect({
      left: 390,
      top: 380,
      width: 120,
      height: 120
    })
  });
}

// Highlights the  "Set of Kitchen Utensils" on the first page
function newHighlightAnnotation() {
  return new PSPDFKit.Annotations.HighlightAnnotation({
    pageIndex: 0,
    boundingBox: new PSPDFKit.Geometry.Rect({
      left: 30,
      top: 424,
      width: 223,
      height: 83
    }),
    rects: PSPDFKit.Immutable.List([
      new PSPDFKit.Geometry.Rect({
        left: 30,
        top: 424,
        width: 223,
        height: 42
      }),
      new PSPDFKit.Geometry.Rect({ left: 30, top: 465, width: 122, height: 42 })
    ])
  });
}

// Creates a Note annotation on the first page
function newNoteAnnotation() {
  return new PSPDFKit.Annotations.NoteAnnotation({
    pageIndex: 0,
    text: "An example for a Note Annotation",
    boundingBox: new PSPDFKit.Geometry.Rect({
      left: 500,
      top: 20,
      width: 30,
      height: 40
    })
  });
}
