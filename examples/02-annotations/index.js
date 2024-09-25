import PSPDFKit from "pspdfkit";
import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

export function load(defaultConfiguration) {
  // PSPDFKit freezes the Options object to prevent changes after the first load
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  // You can find an introductions to annotations in our guides:
  // https://pspdfkit.com/guides/web/current/annotations/introduction-to-annotations/
  return PSPDFKit.load({
    ...defaultConfiguration,
    enableHistory: true,
    enableRichText: () => true,
    toolbarItems: defaultConfiguration.toolbarItems.reduce((acc, item) => {
      if (item.type === "polyline") {
        return acc.concat([item, { type: "undo" }, { type: "redo" }]);
      }

      return acc.concat([item]);
    }, []),
  }).then(async (instance) => {
    // Add event listeners for annotion changes
    instance.addEventListener("annotations.load", (loadedAnnotations) => {
      console.log("Annotations were loaded", loadedAnnotations.toJS());
    });
    instance.addEventListener("annotations.change", function () {
      console.log("Something in the annotations has changed.");
    });
    instance.addEventListener(
      "annotations.create",
      function (createdAnnotations) {
        console.log("New annotations got created", createdAnnotations.toJS());
      }
    );
    instance.addEventListener(
      "annotations.update",
      function (updatedAnnotations) {
        console.log("Annotations got updated", updatedAnnotations.toJS());
      }
    );
    instance.addEventListener(
      "annotations.delete",
      function (deletedAnnotations) {
        console.log("Annotations got deleted", deletedAnnotations.toJS());
      }
    );

    const annotationsOnFirstPage = await instance.getAnnotations(0);

    // For this example we only want to generate the annotations once. Therefore
    // we check if we already have annotations on our Page and if it's the case,
    // don't create them again. Since there is already one annotation within the
    // PDF on the first page, we check if there is less than once annotation.
    if (annotationsOnFirstPage.size <= 1) {
      // Creating a few annotations
      await instance
        .create([
          newInkAnnotation(),
          newTextAnnotation(),
          newEllipseAnnotationAnnotation(),
          newHighlightAnnotation(),
          newNoteAnnotation(),
        ])
        .then(instance.ensureChangesSaved)
        .then(function (savedAnnotations) {
          console.log(
            "Saved annotations with IDs",
            savedAnnotations.map((it) => it.id).join(", ")
          );
        });
    }

    return instance;
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
      left: 50,
    }),
    strokeColor: PSPDFKit.Color.WHITE,
    lines: PSPDFKit.Immutable.List([
      PSPDFKit.Immutable.List([
        new PSPDFKit.Geometry.DrawingPoint({ x: 50, y: 50 }),
        new PSPDFKit.Geometry.DrawingPoint({ x: 200, y: 50 }),
      ]),
      PSPDFKit.Immutable.List([
        new PSPDFKit.Geometry.DrawingPoint({ x: 50, y: 75 }),
        new PSPDFKit.Geometry.DrawingPoint({ x: 200, y: 75 }),
      ]),
      PSPDFKit.Immutable.List([
        new PSPDFKit.Geometry.DrawingPoint({ x: 50, y: 100 }),
        new PSPDFKit.Geometry.DrawingPoint({ x: 200, y: 100 }),
      ]),
    ]),
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
      left: 50,
    }),
    text: { format: "plain", value: "Welcome to\nPSPDFKit" },
    font: "Helvetica",
    isBold: true,
    horizontalAlign: "center",
    verticalAlign: "center",
    backgroundColor: PSPDFKit.Color.BLUE,
    fontColor: PSPDFKit.Color.WHITE,
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
      height: 120,
    }),
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
      height: 83,
    }),
    rects: PSPDFKit.Immutable.List([
      new PSPDFKit.Geometry.Rect({
        left: 30,
        top: 424,
        width: 223,
        height: 42,
      }),
      new PSPDFKit.Geometry.Rect({
        left: 30,
        top: 465,
        width: 122,
        height: 42,
      }),
    ]),
  });
}

// Creates a Note annotation on the first page
function newNoteAnnotation() {
  return new PSPDFKit.Annotations.NoteAnnotation({
    pageIndex: 0,
    text: {
      format: "plain",
      value: "An example for a Note Annotation",
    },
    boundingBox: new PSPDFKit.Geometry.Rect({
      left: 500,
      top: 20,
      width: 30,
      height: 30,
    }),
  });
}
