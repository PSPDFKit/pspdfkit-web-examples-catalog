import PSPDFKit from "pspdfkit";

let instance = null;

let revealedAreasOnPageIndexes = new Set();
let hiddenAreasOnPageIndexes = new Set();

const AnnotationRenderer = ({ annotation }) => {
  if (!isRevealAnnotation(annotation)) {
    return null;
  }

  const node = document.createElement("div");

  node.className = "Revealed-Area";
  node.innerHTML = `
    <div class="Revealed-Area-Top"></div>
    <div class="Revealed-Area-Bottom"></div>
    <div class="Revealed-Area-Left"></div>
    <div class="Revealed-Area-Right"></div>
    <div class="Revealed-Area-TopLeft"></div>
    <div class="Revealed-Area-TopRight"></div>
    <div class="Revealed-Area-BottomLeft"></div>
    <div class="Revealed-Area-BottomRight"></div>
    <div class="Revealed-Area-Center"></div>
  `;

  node.style.pointerEvents = "all";
  node.onclick = function () {
    const selectedAnnotation = instance.getSelectedAnnotation();

    if (!selectedAnnotation) {
      setTimeout(() => instance.setSelectedAnnotation(annotation.id), 0);
    }
  };

  return {
    node,
    append: true,
    onDisappear: () => {},
  };
};

export async function load(defaultConfiguration) {
  instance = await PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: createToolbarItems(),
    styleSheets: ["/hide-reveal-area/static/style.css"],
    initialViewState: new PSPDFKit.ViewState({
      enableAnnotationToolbar: false,
    }),
    annotationTooltipCallback,

    // Add a callback to the Annotation key in the customRenderers configuration
    // field to customize the annotation's appearance by adding a DOM node to
    // it.
    //
    // We use this to implement a custom renderer for reveal annotations.
    customRenderers: {
      Annotation: AnnotationRenderer,
    },
  });

  // Whenever the page changes, we want to also update the toolbar.
  instance.addEventListener("viewState.currentPageIndex.change", updateToolbar);

  // Annotations can still be manually deleted. When this happens, we must also
  // update the toolbar.
  instance.addEventListener(
    "annotations.delete",
    function onDelete(annotations) {
      annotations.filter(isRevealAnnotation).forEach((annotation) => {
        revealedAreasOnPageIndexes.delete(annotation.pageIndex);
      });
      annotations.filter(isHiddenArea).forEach((annotation) => {
        hiddenAreasOnPageIndexes.delete(annotation.pageIndex);
      });

      updateToolbar();
    }
  );

  // We initialize the revealAnnotationsOnPageIndexes and
  // hiddenAnnotationsOnPageIndexes array so that we know which pages already
  // have those annotations.
  for (let pageIndex = 0; pageIndex < instance.totalPageCount; pageIndex++) {
    const annotations = await instance.getAnnotations(pageIndex);

    if (annotations.find(isRevealAnnotation)) {
      revealedAreasOnPageIndexes.add(pageIndex);
    }

    if (annotations.find(isHiddenArea)) {
      hiddenAreasOnPageIndexes.add(pageIndex);
    }
  }

  updateToolbar();

  registerIsDragAndResizeDetector();

  return instance;
}

// To simplify the example, we’re hiding some tools
const HIDDEN_TOOLBAR_ITEMS = [
  "annotate",
  "ink",
  "highlighter",
  "text-highlighter",
  "ink-signature",
  "image",
  "stamp",
  "note",
  "text",
  "line",
  "arrow",
  "rectangle",
  "ellipse",
  "polygon",
  "polyline",
  "print",
  "search",
  "document-editor",
  "ink-eraser",
  "document-crop",
];

function createToolbarItems() {
  const items = PSPDFKit.defaultToolbarItems.filter(
    (item) => !HIDDEN_TOOLBAR_ITEMS.includes(item.type)
  );

  if (instance) {
    const currentPageIndex = instance.viewState.currentPageIndex;

    const currentPageHasRevealedArea =
      revealedAreasOnPageIndexes.has(currentPageIndex);

    const currentPageHasHiddenArea =
      hiddenAreasOnPageIndexes.has(currentPageIndex);

    if (currentPageHasRevealedArea) {
      items.push({
        type: "custom",
        title: "Reset",
        onPress: () => removeAnnotationsFromPage(currentPageIndex),
      });
    } else {
      items.push({
        type: "custom",
        title: "Reveal Area",
        onPress: () => addRevealedArea(currentPageIndex),
        disabled: currentPageHasHiddenArea,
      });
    }

    if (currentPageHasHiddenArea) {
      items.push({
        type: "custom",
        title: "Reset",
        onPress: () => removeAnnotationsFromPage(currentPageIndex),
      });
    } else {
      items.push({
        type: "custom",
        title: "Hide Area",
        onPress: () => addHiddenArea(currentPageIndex),
        disabled: currentPageHasRevealedArea,
      });
    }
  }

  return items;
}

function updateToolbar() {
  instance.setToolbarItems(createToolbarItems());
}

async function addRevealedArea(currentPageIndex) {
  const [annotation] = await instance.create(
    new PSPDFKit.Annotations.RectangleAnnotation({
      boundingBox: new PSPDFKit.Geometry.Rect({
        top: 160,
        left: 50,
        width: 309,
        height: 168,
      }),
      pageIndex: currentPageIndex,
      strokeColor: null,
      customData: { revealedArea: true },
    })
  );

  instance.setSelectedAnnotation(annotation);

  revealedAreasOnPageIndexes.add(currentPageIndex);
  updateToolbar();
}

async function addHiddenArea(currentPageIndex) {
  const [annotation] = await instance.create(
    new PSPDFKit.Annotations.RectangleAnnotation({
      boundingBox: new PSPDFKit.Geometry.Rect({
        top: 160,
        left: 370,
        width: 200,
        height: 560,
      }),
      pageIndex: currentPageIndex,
      strokeColor: PSPDFKit.Color.BLACK,
      fillColor: PSPDFKit.Color.BLACK,
      customData: { hiddenArea: true },
    })
  );

  instance.setSelectedAnnotation(annotation);

  hiddenAreasOnPageIndexes.add(currentPageIndex);
  updateToolbar();
}

async function removeAnnotationsFromPage(pageIndex) {
  const annotations = await instance.getAnnotations(pageIndex);

  annotations
    .filter(
      (annotation) => isRevealAnnotation(annotation) || isHiddenArea(annotation)
    )
    .forEach((annotation) => {
      instance.delete(annotation.id);
    });

  revealedAreasOnPageIndexes.delete(pageIndex);
  hiddenAreasOnPageIndexes.delete(pageIndex);
  updateToolbar();
}

function isRevealAnnotation(annotation) {
  const isRectangle =
    annotation instanceof PSPDFKit.Annotations.RectangleAnnotation;

  return isRectangle && annotation.customData.revealedArea === true;
}

function isHiddenArea(annotation) {
  const isRectangle =
    annotation instanceof PSPDFKit.Annotations.RectangleAnnotation;

  return isRectangle && annotation.customData.hiddenArea === true;
}

// The annotation tooltip can be used to place annotation tools directly on top
// of the annotation on screen.
//
// In this example, we use it as an alternative to the default annotation
// toolbars.
//
// https://web-examples.pspdfkit.com/tooltips
function annotationTooltipCallback(annotation) {
  const deleteAnnotation = {
    type: "custom",
    title: "Delete",
    onPress: () => {
      if (confirm("Do you really want to delete the annotation?")) {
        instance.delete(annotation.id);
      }
    },
  };

  return [deleteAnnotation];
}

function registerIsDragAndResizeDetector() {
  let isDraggingOrResizing = false;

  instance.contentDocument.onmousedown = function (event) {
    if (svgElementHasClass(event.target, "PSPDFKit-Selection-Outline-Border")) {
      isDraggingOrResizing = true;
    }

    if (svgElementHasClass(event.target, "PSPDFKit-Resize-Anchor")) {
      isDraggingOrResizing = true;
    }
  };

  instance.contentDocument.onmouseup = function () {
    isDraggingOrResizing = false;
    instance.contentDocument.body.removeAttribute(
      "data-is-dragging-or-resizing",
      "true"
    );
  };

  instance.contentDocument.onmousemove = function (event) {
    if (event.buttons !== 1 || !isDraggingOrResizing) {
      return;
    }

    instance.contentDocument.body.setAttribute(
      "data-is-dragging-or-resizing",
      "true"
    );
  };
}

function svgElementHasClass(element, className) {
  if (typeof element.className.baseVal !== "string") {
    // Not an SVG element
    return false;
  }

  return element.className.baseVal.split(" ").indexOf(className) >= 0;
}
