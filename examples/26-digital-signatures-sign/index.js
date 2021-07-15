// Since implementations are different depending on the deployment
// we splitted the specific implementation details of each backend
// on its own module. We load them both even though we only need
// the one from the current backend to avoid waiting to dynamically
// fetch and load the relevant implementation.
import standalone from "./standalone.js";
import server from "./server.js";

export async function load(defaultConfiguration) {
  // PSPDFKit.Configuration#authPayload is a Server only property.
  // We check for its presence to determine which module to use
  const deployment = defaultConfiguration.authPayload ? server : standalone;

  return deployment(defaultConfiguration);
}

export async function attachListeners(instance, buttons) {
  instance.addEventListener("document.change", async () => {
    // Enable the "Reset" button if the document is signed
    const annotations = await instance.getAnnotations(0);

    updateToolbarItems(annotations, true, instance, buttons);
  });

  instance.addEventListener(
    "annotations.create",
    async (createdAnnotations) => {
      const signatures = await instance.getSignaturesInfo();
      const isDocumentSigned = signatures.status !== "not_signed";

      if (isDocumentSigned) {
        // Bailing out since we just need to handle the scenario before a digital signature
        // has been placed.
        return;
      }

      const annotation = createdAnnotations.get(0);

      if (annotation.isSignature) {
        // Position the created signature over signature form field
        // and enable the "Finish Signing" button.
        positionSignature(annotation, instance);
        await instance.ensureChangesSaved(annotation);
        updateToolbarItems(createdAnnotations, true, instance, buttons);
      }
    }
  );

  instance.addEventListener("annotations.delete", (deletedAnnotations) => {
    // Disable the "Finish Signing" button if a signature has been deleted
    updateToolbarItems(deletedAnnotations, false, instance, buttons);
  });

  const annotations = await instance.getAnnotations(0);

  updateToolbarItems(annotations, true, instance, buttons);

  return instance;
}

// Checks what toolbar items need to be enabled/disabled at a given time.
// When the document doesn't have any electronic signature yet, we want to
// disable the "Finish signing" button. Once a signature is placed, it
// the electronic signature button should be disabled and the "Finish signing"
// should be enabled instead.
// Once the document has been signed, we show the "Reset" button.
async function updateToolbarItems(
  annotations,
  disableFinishIfNoAnnotations,
  instance,
  buttons
) {
  const signatures = await instance.getSignaturesInfo();
  const { resetButton, saveButton, finishButton } = buttons;
  const hasSignatureAnnotation = annotations.some(
    (annotation) => annotation.isSignature
  );
  // When the document is loaded and when a signature annotation is
  // created or deleted, we need to enable or disable the signing custom
  // toolbar item accordingly. The "disableFinishIfNoAnnotations" boolean
  // will determine which disable state we'll update the toolbar button with.
  const shouldDisableFinishBtn = disableFinishIfNoAnnotations
    ? !hasSignatureAnnotation
    : hasSignatureAnnotation;
  const additionalButtons =
    signatures.status === "not_signed"
      ? [
          {
            type: "signature",
            disabled: !shouldDisableFinishBtn,
          },
          {
            ...finishButton,
            disabled: shouldDisableFinishBtn,
          },
          saveButton,
        ]
      : [{ type: "signature", disabled: true }, resetButton, saveButton];

  instance.setToolbarItems([...initialToolbarItems, ...additionalButtons]);
}

// Helper function to properly place the signature annotation
// added by the user to the corresponding spot on the document.
// Based on https://pspdfkit.com/guides/web/current/knowledge-base/override-ink-signature-dialog/
function positionSignature(annotation, instance) {
  // appropiate rect for the space to fit the annotation in
  const signingSpace = new PSPDFKit.Geometry.Rect({
    width: 150,
    height: 40,
    left: 375,
    top: 690,
  });

  const newSize = fitIn(
    {
      width: annotation.boundingBox.width,
      height: annotation.boundingBox.height,
    },
    {
      width: signingSpace.width,
      height: signingSpace.height,
    }
  );
  const resizeRatio = newSize.width / annotation.boundingBox.width;
  const newLeft =
    signingSpace.left + signingSpace.width / 2 - newSize.width / 2;
  const newTop =
    signingSpace.top + signingSpace.height / 2 - newSize.height / 2;

  const newBoundingBox = new PSPDFKit.Geometry.Rect({
    left: newLeft,
    top: newTop,
    width: newSize.width,
    height: newSize.height,
  });

  if (annotation.lines) {
    const newLines = annotation.lines.map((line) => {
      return line.map((point) => {
        return new PSPDFKit.Geometry.DrawingPoint({
          x: newLeft + (point.x - annotation.boundingBox.left) * resizeRatio,
          y: newTop + (point.y - annotation.boundingBox.top) * resizeRatio,
        });
      });
    });

    instance.update(
      annotation
        .set("boundingBox", newBoundingBox)
        .set("lines", newLines)
        .set("lineWidth", annotation.lineWidth * resizeRatio)
    );
  } else {
    instance.update(annotation.set("boundingBox", newBoundingBox));
  }
}

function fitIn(size, containerSize) {
  const { width, height } = size;

  const widthRatio = containerSize.width / width;
  const heightRatio = containerSize.height / height;

  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: width * ratio,
    height: height * ratio,
  };
}

export const initialToolbarItems = [
  { type: "sidebar-thumbnails" },
  { type: "sidebar-bookmarks" },
  { type: "zoom-in" },
  { type: "zoom-out" },
  { type: "spacer" },
];
