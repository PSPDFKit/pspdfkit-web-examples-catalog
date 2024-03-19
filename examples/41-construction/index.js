import PSPDFKit from "pspdfkit";
import {
  annotationsSidebarIcon,
  showAnnotationsIcon,
  hideAnnotationsIcon,
  pinDropIcon,
} from "./icons";

let areAnnotationsVisible = true;

export function load(defaultConfiguration) {
  const hiddenButtons = [
    "sidebar-thumbnails",
    "sidebar-document-outline",
    "sidebar-annotations",
    "sidebar-bookmarks",
    "pager",
    "layout",
    "stamp",
  ];

  let instance;
  let pinSelected = false;

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: PSPDFKit.defaultToolbarItems.reduce((acc, ti) => {
      if (hiddenButtons.includes(ti.type)) {
        return acc;
      }

      if (ti.type === "pan") {
        return [
          ...acc,
          {
            type: "custom",
            title: "Annotations Sidebar",
            id: "annotations-sidebar",
            icon: annotationsSidebarIcon,
            dropdownGroup: "sidebar",
            onPress() {
              instance.setViewState((v) =>
                v.set(
                  "sidebarMode",
                  v.sidebarMode === PSPDFKit.SidebarMode.ANNOTATIONS
                    ? null
                    : PSPDFKit.SidebarMode.ANNOTATIONS
                )
              );

              instance.setToolbarItems((ti) =>
                ti.map((item) => {
                  if (
                    item.type === "custom" &&
                    item.id === "annotations-sidebar"
                  ) {
                    return {
                      ...item,
                      selected: !item.selected,
                    };
                  }

                  return item;
                })
              );
            },
          },
          { type: "pan" },
        ];
      }

      if (ti.type === "zoom-mode") {
        return [
          ...acc,
          { type: "zoom-mode" },
          {
            type: "custom",
            id: "toggle-annotations-visibility",
            title: "Hide Annotations",
            icon: hideAnnotationsIcon,
            onPress() {
              toggleAnnotationsVisibility(instance);
            },
          },
        ];
      }

      if (ti.type === "image") {
        return [
          ...acc,
          { type: "image" },
          {
            type: "custom",
            id: "pin-drop",
            title: "Pin Drop",
            icon: pinDropIcon,
            selected: pinSelected,
            onPress() {
              pinSelected = !pinSelected;
              instance.setViewState((viewState) =>
                viewState.set("interactionMode", null)
              );
              updateToolbarItems(instance, pinSelected);
            },
          },
        ];
      }

      if (
        ti.type === "rectangle" ||
        ti.type === "ellipse" ||
        ti.type === "polygon" ||
        ti.type === "cloudy-polygon"
      ) {
        return acc;
      }

      if (ti.type === "polyline") {
        return [
          ...acc,
          { type: "polyline" },
          { type: "cloudy-polygon", dropdownGroup: "shape-variants" },
          { type: "cloudy-rectangle", dropdownGroup: "shape-variants" },
          { type: "cloudy-ellipse", dropdownGroup: "shape-variants" },
          { type: "dashed-polygon", dropdownGroup: "shape-variants" },
          { type: "dashed-rectangle", dropdownGroup: "shape-variants" },
          { type: "dashed-ellipse", dropdownGroup: "shape-variants" },
          { type: "polygon", dropdownGroup: "shape-variants" },
          { type: "rectangle", dropdownGroup: "shape-variants" },
          { type: "ellipse", dropdownGroup: "shape-variants" },
        ];
      }

      return [...acc, ti];
    }, []),
    styleSheets: ["/construction/static/style.css"],
    customRenderers: {
      Annotation({ annotation }) {
        if (
          annotation.customData &&
          annotation.customData.isPinStampAnnotation
        ) {
          const node = document.createElement("div");

          requestAnimationFrame(() => {
            let commonAncestor = node;
            let annotationNoteNode;

            while (!annotationNoteNode) {
              commonAncestor = commonAncestor.parentNode;

              if (!commonAncestor) break;

              annotationNoteNode = commonAncestor.querySelector(
                ".PSPDFKit-Annotation-Note"
              );
            }

            if (annotationNoteNode) {
              const annotationNoteNodeParent = annotationNoteNode.parentNode;
              annotationNoteNodeParent.style.left =
                annotation.boundingBox.left * instance.currentZoomLevel + "px";
              annotationNoteNodeParent.style.top =
                annotation.boundingBox.top * instance.currentZoomLevel + "px";
              annotationNoteNodeParent.style.width =
                annotation.boundingBox.width * instance.currentZoomLevel + "px";
              annotationNoteNodeParent.style.height =
                annotation.boundingBox.height * instance.currentZoomLevel +
                "px";
            }
          });

          return {
            node,
            append: true,
          };
        }
      },
    },
  }).then((_instance) => {
    instance = _instance;

    console.log("PSPDFKit for Web successfully loaded!!", instance);

    instance.setCurrentAnnotationPreset("cloudy-polygon");
    instance.setViewState((viewState) =>
      viewState.set("interactionMode", PSPDFKit.InteractionMode.SHAPE_POLYGON)
    );

    let pinImageAttachmentId;

    instance.addEventListener("page.press", async ({ point }) => {
      if (pinSelected) {
        if (!pinImageAttachmentId) {
          const res = await fetch("/construction/static/pin-drop-red.pdf");
          const blob = await res.blob();

          pinImageAttachmentId = await instance.createAttachment(blob);
        }

        const pinStamp = new PSPDFKit.Annotations.ImageAnnotation({
          pageIndex: instance.viewState.currentPageIndex,
          imageAttachmentId: pinImageAttachmentId,
          contentType: "application/pdf",
          boundingBox: new PSPDFKit.Geometry.Rect({
            left: point.x - 16,
            top: point.y - 32,
            width: 32,
            height: 32,
          }),
          note: `Created on ${new Date().toLocaleString()}`,
          customData: {
            isPinStampAnnotation: true,
          },
        });

        instance.create(pinStamp);
      }
    });

    instance.addEventListener("viewState.change", (viewState) => {
      if (viewState.interactionMode !== null) {
        pinSelected = false;
        updateToolbarItems(instance, pinSelected);
      }
    });

    return instance;
  });
}

async function toggleAnnotationsVisibility(instance) {
  const pagesAnnotations = await Promise.all(
    Array.from({ length: instance.totalPageCount }).map((_, pageIndex) =>
      instance.getAnnotations(pageIndex)
    )
  );
  const toggledAnnotations = pagesAnnotations.reduce(
    (acc, pageAnnotations) => [
      ...acc,
      ...pageAnnotations
        .map((annotation) => annotation.update("noView", (noView) => !noView))
        .toArray(),
    ],
    []
  );

  areAnnotationsVisible = !areAnnotationsVisible;

  instance.setToolbarItems((ti) =>
    ti.map((item) => {
      if (
        item.type === "custom" &&
        item.id === "toggle-annotations-visibility"
      ) {
        return {
          ...item,
          icon: areAnnotationsVisible
            ? hideAnnotationsIcon
            : showAnnotationsIcon,
          title: areAnnotationsVisible
            ? "Hide Annotations"
            : "Show Annotations",
        };
      }

      return item;
    })
  );

  return instance.update(toggledAnnotations);
}

function updateToolbarItems(instance, pinSelected) {
  instance.setToolbarItems((ti) =>
    ti.map((item) => {
      if (item.type === "custom" && item.id === "pin-drop") {
        return { ...item, selected: pinSelected };
      }

      return item;
    })
  );
}
