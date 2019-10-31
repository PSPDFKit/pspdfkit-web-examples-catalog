import PSPDFKit from "pspdfkit";
import * as React from "react";

// Assign the PSPDFKit instance to a module variable so we can access it
// everywhere.
let instance = null;

// We track wether or not drag and drop is supported on the device. If not, we
// allow clicking an item to place it as well (e.g on iPhones)
let isDragAndDropSupported = false;

export function load(defaultConfiguration) {
  // We first find out how much space we have available. Based on that, we
  // decide wether to turn on the sidebar or not.
  const viewWidth = document.querySelector(".splitPane").getBoundingClientRect()
    .width;

  // We start by initializing an initial ViewState that hides all toolbars,
  // opens the thumbnail sidebar, and places the sidebar on the other side.
  const initialViewState = new PSPDFKit.ViewState({
    showToolbar: false,
    enableAnnotationToolbar: false,
    sidebarMode: viewWidth > 1100 ? PSPDFKit.SidebarMode.THUMBNAILS : null,
    sidebarPlacement: PSPDFKit.SidebarPlacement.END
  });

  // Initialize a new PSPDFKit Viewer with the initial view state and custom
  // stylesheets.
  return PSPDFKit.load({
    ...defaultConfiguration,
    initialViewState,
    styleSheets: ["/drag-and-drop/static/style.css"],
    annotationTooltipCallback
  }).then(_instance => {
    instance = _instance;

    // We only allow dropping elements onto a PDF page.
    instance.contentDocument.ondragover = function(event) {
      isDragAndDropSupported = true;
      const pageElement = closestByClass(event.target, "PSPDFKit-Page");
      if (pageElement) {
        // Allow drop operation
        event.preventDefault();
      }
    };

    instance.contentDocument.ondrop = function(event) {
      isDragAndDropSupported = true;
      const pageElement = closestByClass(event.target, "PSPDFKit-Page");
      if (pageElement) {
        const pageIndex = parseInt(pageElement.dataset.pageIndex);

        const isExternalDrop = event.dataTransfer.files.length > 0;

        if (isExternalDrop) {
          handleExternalDrop(event, pageIndex);
        } else {
          handleInternalDrop(event, pageIndex);
        }
      }
    };

    return instance;
  });
}

// Event handler that is called when a file from outside is dropped onto the PDF
// page.
function handleExternalDrop(event, pageIndex) {
  const file = event.dataTransfer.files[0];
  const allowedExternalMimeTypes = ["image/jpeg", "image/png"];

  if (!allowedExternalMimeTypes.includes(file.type)) {
    return;
  }

  const clientX = event.clientX;
  const clientY = event.clientY;

  // We don't know the dimensions of the image. To do this, we first parse it
  // with the use of this helper function. Note that it will run async so we
  // continue in the callback function.
  parseImageDimensions(file, dimensions => {
    const ratio = dimensions.height / dimensions.width;

    // External drag and drop items will have the cursor in the middle of the
    // bounding box.
    // We also scale the image so that the aspect ratio is kept.
    const width = 220;
    const height = width * ratio;

    const clientRect = new PSPDFKit.Geometry.Rect({
      left: clientX - width / 2,
      top: clientY - height / 2,
      width,
      height
    });

    const pageRect = instance.transformContentClientToPageSpace(
      clientRect,
      pageIndex
    );

    insertImageAnnotation(pageRect, file, pageIndex);
  });

  event.preventDefault();
}

// Event handler that is called when an annotation from the internal toolbar is
// dropped onto a PDF page.
function handleInternalDrop(event, pageIndex) {
  // We know that internal drag and drop objects will have the cursor on the
  // top left left side of the box. We also know the dimensions of the
  // rectangles.
  const clientRect = new PSPDFKit.Geometry.Rect({
    left: event.clientX,
    top: event.clientY,
    width: 220,
    height: 217
  });
  const pageRect = instance.transformContentClientToPageSpace(
    clientRect,
    pageIndex
  );

  // We generate text data with a string that either prefixes `pspdfkit/text` or
  // `pspdfkit/image`.
  const data = event.dataTransfer.getData("text");

  if (data.startsWith("pspdfkit/text")) {
    const text = data.replace("pspdfkit/text:", "");
    insertTextAnnotation(
      pageRect,
      text,
      pageIndex,
      26 / instance.currentZoomLevel
    );
    event.preventDefault();
  } else if (data.startsWith("pspdfkit/image")) {
    const imageUrl = data.replace("pspdfkit/image:", "");
    fetch(imageUrl)
      .then(r => r.blob())
      .then(blob => insertImageAnnotation(pageRect, blob, pageIndex));
    event.preventDefault();
  }
}

// Event handler for preparing image drag and drop
function setDragImageData(event) {
  isDragAndDropSupported = true;
  event.dataTransfer.setData("text", "pspdfkit/image:" + event.target.src);
  event.dataTransfer.setDragImage &&
    event.dataTransfer.setDragImage(event.target, 0, 0);
  event.stopPropagation();
}

// Event handler for preparing text drag and drop
function setDragTextData(event) {
  isDragAndDropSupported = true;
  event.dataTransfer.setData("text", "pspdfkit/text:" + event.target.innerText);
  event.dataTransfer.setDragImage &&
    event.dataTransfer.setDragImage(event.target, 0, 0);
  event.stopPropagation();
}

// Handles click events on draggable image items on non draggable devices
function handleImageClick(event) {
  if (isDragAndDropSupported || !instance) {
    return;
  }

  const target = event.target;
  fetch(target.src)
    .then(r => r.blob())
    .then(blob => {
      const pageIndex = instance.viewState.currentPageIndex;
      const pageInfo = instance.pageInfoForIndex(pageIndex);

      insertImageAnnotation(
        new PSPDFKit.Geometry.Rect({
          width: target.width,
          height: target.height,
          left: pageInfo.width / 2 - target.width / 2,
          top: pageInfo.height / 2 - target.height / 2
        }),
        blob,
        pageIndex
      );
    });
}

// Handles click events on draggable text items on non draggable devices
function handleTextClick(event) {
  if (isDragAndDropSupported || !instance) {
    return;
  }

  const target = event.target;
  const pageIndex = instance.viewState.currentPageIndex;
  const pageInfo = instance.pageInfoForIndex(pageIndex);

  insertTextAnnotation(
    new PSPDFKit.Geometry.Rect({
      width: 220,
      height: 217,
      left: pageInfo.width / 2 - 220 / 2,
      top: pageInfo.height / 2 - 217 / 2
    }),
    target.innerText,
    pageIndex,
    26
  );
}

// Inserts a text annotation on the page.
// https://pspdfkit.com/guides/web/current/annotations/introduction-to-annotations/
function insertTextAnnotation(pageRect, text, pageIndex, fontSize) {
  const annotation = new PSPDFKit.Annotations.TextAnnotation({
    boundingBox: pageRect,
    text,
    pageIndex,
    fontSize,
    horizontalAlign: "center",
    verticalAlign: "center",
    backgroundColor: PSPDFKit.Color.WHITE
  });

  instance.createAnnotation(annotation).then(instance.setSelectedAnnotation);
}

// Inserts an image annotation on the page.
// https://pspdfkit.com/guides/web/current/annotations/introduction-to-annotations/
function insertImageAnnotation(pageRect, blob, pageIndex) {
  instance.createAttachment(blob).then(attachmentId => {
    const annotation = new PSPDFKit.Annotations.ImageAnnotation({
      pageIndex,
      boundingBox: pageRect,
      contentType: "image/jpeg",
      imageAttachmentId: attachmentId
    });

    instance.createAnnotation(annotation).then(instance.setSelectedAnnotation);
  });
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
        instance.deleteAnnotation(annotation.id);
      }
    }
  };

  if (annotation instanceof PSPDFKit.Annotations.TextAnnotation) {
    const increaseFontSize = {
      type: "custom",
      title: "Bigger",
      onPress: () => {
        annotation = annotation.set("fontSize", annotation.fontSize * 1.2);
        annotation = instance.calculateFittingTextAnnotationBoundingBox(
          annotation
        );

        instance.updateAnnotation(annotation);
      }
    };

    const decreaseFontSize = {
      type: "custom",
      title: "Smaller",
      onPress: () => {
        annotation = annotation.set("fontSize", annotation.fontSize / 1.2);
        annotation = instance.calculateFittingTextAnnotationBoundingBox(
          annotation
        );

        instance.updateAnnotation(annotation);
      }
    };

    return [increaseFontSize, decreaseFontSize, deleteAnnotation];
  } else {
    return [deleteAnnotation];
  }
}

// Given a File object, we can create an <image/> tag to parse the image and
// retrieve the original dimensions.
function parseImageDimensions(file, onDimensions) {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onerror = () => URL.revokeObjectURL(url);
  image.onload = () => {
    onDimensions({ width: image.width, height: image.height });
    URL.revokeObjectURL(url);
  };
  image.src = url;
}

const tools = [
  { type: "image", filename: "product1.jpg" },
  { type: "image", filename: "product2.jpg" },
  { type: "image", filename: "product3.jpg" },
  { type: "text", text: "Best Price" },
  { type: "text", text: "Top Service" }
];

// By exporting a CustomContainer, we can customize the HTML structure that is
// used by the catalog app.
// We do this so that we can show the sidebar and fill it with some example
// tools.
export const CustomContainer = React.forwardRef((instance, ref) => (
  <div className="splitPane">
    <div className="splitPane-left">
      {tools.map(tool => {
        if (tool.type === "image") {
          return (
            <div key={tool.filename} className="image-tool tool">
              <img
                src={"/drag-and-drop/static/" + tool.filename}
                width="220"
                height="217"
                onDragStart={setDragImageData}
                onClick={handleImageClick}
                draggable
              />
            </div>
          );
        } else {
          return (
            <div
              key={tool.text}
              className="text-tool tool"
              onDragStart={setDragTextData}
              onClick={handleTextClick}
              draggable
            >
              {tool.text}
            </div>
          );
        }
      })}
    </div>
    <div className="splitPane-right" ref={ref} />

    <style jsx>{`
      .splitPane {
        width: 100%;
        height: 100%;
        background: #f6f8fa;
        display: flex;
      }

      .splitPane-left {
        background-color: rgb(250, 251, 251);
        padding: 10px;
      }

      .splitPane-right {
        height: 100%;
        flex-grow: 1;
      }

      .tool {
        margin: 10px;
      }

      .image-tool {
        display: block;
        cursor: pointer;
      }

      .image-tool img {
        outline: 2px solid #eee;
        outline-offset: -2px;
      }

      .text-tool {
        width: 220px;
        height: 217px;
        cursor: pointer;
        font-size: 26px;
        text-align: center;
        line-height: 217px;
        font-weight: bold;
        border: 2px solid #eee;
        color: #444;
        background: white;
      }

      @media only screen and (min-width: 768px) {
        .splitPane-left {
          width: 300px;
          height: 100vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 0 20px;
          box-shadow: 5px 0 5px rgba(200, 200, 200, 0.2);
        }

        .splitPane {
          flex-direction: row;
        }

        .tool {
          display: block;
        }
      }

      @media only screen and (max-width: 767px) {
        .splitPane-left {
          width: auto;
          overflow-y: hidden;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding: 0px;
          box-shadow: 5px 0 5px rgba(200, 200, 200, 0.2);
          white-space: nowrap;
        }

        .splitPane-right {
          height: calc(100% - 150px);
        }

        .splitPane {
          flex-direction: column;
        }

        .tool,
        .tool > img {
          width: 110px;
          height: 108px;
          display: inline-block;
        }

        .text-tool {
          font-size: 13px;
          line-height: 108px;
        }

        .tool {
          vertical-align: top;
        }
      }
    `}</style>
  </div>
));

function closestByClass(el, className) {
  return el && el.classList && el.classList.contains(className)
    ? el
    : el
    ? closestByClass(el.parentNode, className)
    : null;
}
