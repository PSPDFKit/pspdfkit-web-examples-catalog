import PSPDFKit from "@nutrient-sdk/viewer";
import React from "react";
import { Buffer } from "buffer";

import styles from "./static/styles";
import warningStyles from "./static/warningStyles.js";

let globalSetIsServer;
let instance = null;

export async function load(defaultConfiguration) {
  if (defaultConfiguration.authPayload) {
    globalSetIsServer && globalSetIsServer(true);

    return;
  }

  globalSetIsServer && globalSetIsServer(false);

  const { toolbarItems } = defaultConfiguration;

  // Retrieve certificates for the signer and any CAs to trust the created signatures.
  const certificatesResponse = await fetch(
    "/api/get-signing-service-certificates",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    }
  );

  if (!certificatesResponse.ok) {
    throw new Error("Failed to fetch certificates");
  }

  const certificates = await certificatesResponse.json();

  const buttons = createButtons(prepareCertificates(certificates));

  // split the rest of the toolbar items from the save button so that
  // later we can keep it as the last item while adding the sign button
  buttons.saveButton = toolbarItems[toolbarItems.length - 1];

  instance = await PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: initialToolbarItems,
    styleSheets: ["/digital-signatures-sign/static/styles.css"],
    initialViewState: new PSPDFKit.ViewState({
      showSignatureValidationStatus:
        PSPDFKit.ShowSignatureValidationStatusMode.IF_SIGNED,
    }),
    async trustedCAsCallback() {
      return certificates.ca_certificates.map((cert) =>
        decodeBase64String(cert)
      );
    },
  });

  console.log("Nutrient Web SDK successfully loaded!!", instance);
  attachListeners(instance, buttons);

  return instance;
}

function prepareCertificates(encodedCertificates) {
  // Produce a list of certificates for signing request.
  // Head of the list needs to be the signing certificates,
  // rest is the rest of the certificates chain which
  // does not need to have any particular order.
  return encodedCertificates.certificates
    .concat(encodedCertificates.ca_certificates)
    .map((cert) => decodeBase64String(cert));
}

async function signCallback({ dataToBeSigned }) {
  // Pass the dataToBeSigned to backend for signing.
  const signResponse = await fetch("/api/sign-via-service", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({
      dataToBeSigned: Buffer.from(dataToBeSigned, "binary").toString("base64"),
      hashAlgorithm: "sha256",
      signatureType: "cades",
    }),
  });

  if (!signResponse.ok) {
    throw new Error("Failed to sign");
  }

  return await signResponse.arrayBuffer();
}

function decodeBase64String(b64str) {
  return Buffer.from(b64str, "base64").toString();
}

function createButtons(certificates) {
  return {
    saveButton: null,
    finishButton: {
      type: "custom",
      title: "Finish Signing",
      className: "finish-signing",
      name: "sign",
      async onPress() {
        // When "Finish Signing" is pressed, after the user
        // has added an ink signature, we proceed to apply
        // a digital signature to the document. From this
        // point on the integrity of the file is guaranteed.
        try {
          await instance.signDocument(
            {
              signingData: {
                signatureType: PSPDFKit.SignatureType.CAdES,
                signatureContainer: PSPDFKit.SignatureContainerType.raw,
                certificates,
              },
            },
            signCallback
          );
          console.log("New signature added to the document!");
        } catch (error) {
          console.error(error);
        }
      },
    },
    resetButton: {
      type: "custom",
      title: "Reset",
      name: "reset",
      async onPress() {
        location.reload();
      },
    },
  };
}

async function attachListeners(instance, buttons) {
  instance.addEventListener("document.change", async () => {
    // Enable the "Reset" button if the document is signed
    const annotations = await instance.getAnnotations(0);

    updateToolbarItems(annotations, true, instance, buttons);
  });

  instance.addEventListener(
    "annotations.create",
    async (createdAnnotations) => {
      const signatures = await instance.getSignaturesInfo();
      const isDocumentSigned =
        signatures.status !== PSPDFKit.DocumentValidationStatus.not_signed;

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
    signatures.status === PSPDFKit.DocumentValidationStatus.not_signed
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
// Based on https://www.nutrient.io/guides/web/knowledge-base/override-ink-signature-dialog/
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

const initialToolbarItems = [
  { type: "sidebar-thumbnails" },
  { type: "sidebar-bookmarks" },
  { type: "zoom-in" },
  { type: "zoom-out" },
  { type: "spacer" },
];

// By exporting a CustomContainer, we can customize the HTML structure that is
// used by the catalog app.
// We do this so that we can show the top bar and fill it with some example
// tools.
export const CustomContainer = React.forwardRef((instance, ref) => {
  const [isServer, setIsServer] = React.useState(false);

  React.useEffect(() => {
    globalSetIsServer = setIsServer;
  }, [setIsServer]);

  const ServerWarning = (
    <div className="phases__phase">
      <style jsx>{warningStyles}</style>
      <div className="info">
        <div className="info-content">
          <span className="info-icon">
            <InlineSvgComponent src={require("./static/information.js")} />
          </span>
          <h2>Not available in server mode</h2>
          <p>{exampleNotSupportedMessage}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100%" }}>
      <style jsx>{styles}</style>
      {isServer && ServerWarning}
      <div
        id="nutrient"
        className="container"
        ref={ref}
        style={{ height: "100%", flexGrow: 1 }}
      ></div>
    </div>
  );
});

const InlineSvgComponent = ({ src, ...otherProps }) => {
  return <span {...otherProps} dangerouslySetInnerHTML={{ __html: src }} />;
};

const exampleNotSupportedMessage =
  "The external signing example is not available on server-backed setup.";
