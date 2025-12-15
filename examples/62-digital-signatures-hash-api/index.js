import PSPDFKit from "@nutrient-sdk/viewer";
import React from "react";
import { Buffer } from "buffer";

import styles from "./static/styles.js";
import warningStyles from "./static/warningStyles.js";

let globalSetIsServer;
let instance = null;

let signatureType;

/**
 * We use Nutrient DWS API as a backend in this example.
 * Change to `document-engine` to use the Document Engine.
 */
let backend = "dws";

export async function load(defaultConfiguration) {
  if (defaultConfiguration.authPayload) {
    globalSetIsServer && globalSetIsServer(true);

    return;
  }

  globalSetIsServer && globalSetIsServer(false);

  signatureType = PSPDFKit.SignatureType.CAdES;

  const { toolbarItems } = defaultConfiguration;

  // Retrieve certificates for the signer and any CAs to trust the created signatures.
  // Implemented in catalog's backend, see ../../_server/server.js for more details.
  const certificatesResponse = await fetch(
    `/api/get-certificates?backend=${backend}`,
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

  const buttons = createButtons();

  // Split the rest of the toolbar items from the save button so that
  // later we can keep it as the last item while adding the sign button.
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

async function signDocument(instance) {
  // Request the client auth token from the backend.
  // Implemented in catalog's backend, see ../../_server/server.js for more details.
  const authResponse = await fetch(
    `/api/create-auth-token?backend=${backend}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        allowedOperations: ["digital_signatures_api"],
      }),
    }
  );

  if (!authResponse.ok) {
    throw new Error("Failed to create auth token");
  }

  const authPayload = await authResponse.json();
  console.log(`Using auth token: ${authPayload.jwt}`);

  // Use the client auth token to perform the signing operation via DWS API.
  await instance.signDocument(
    {
      signingData: {
        signatureType,
        padesLevel: PSPDFKit.PAdESLevel.b_lt,
      },
    },
    {
      jwt: authPayload.jwt,
    }
  );
}

function decodeBase64String(b64str) {
  return Buffer.from(b64str, "base64").toString();
}

function createButtons() {
  return {
    saveButton: null,
    finishButton: {
      type: "custom",
      title: "Sign Document",
      className: "finish-signing",
      name: "sign",
      async onPress() {
        // When "Finish Signing" is pressed, after the user
        // has added an ink signature, we proceed to apply
        // a digital signature to the document. From this
        // point on the integrity of the file is guaranteed.
        try {
          await signDocument(instance);
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
    updateToolbarItems(instance, buttons);
  });

  updateToolbarItems(instance, buttons);

  return instance;
}

// Checks what toolbar items need to be enabled/disabled at a given time.
// When the document doesn't have any electronic signature yet, we want to
// disable the "Finish signing" button. Once a signature is placed, it
// the electronic signature button should be disabled and the "Finish signing"
// should be enabled instead.
// Once the document has been signed, we show the "Reset" button.
async function updateToolbarItems(instance, buttons) {
  const signatures = await instance.getSignaturesInfo();
  const { resetButton, saveButton, finishButton } = buttons;

  // When the document is loaded and when a signature annotation is
  // created or deleted, we need to enable or disable the signing custom
  // toolbar item accordingly. The "disableFinishIfNoAnnotations" boolean
  // will determine which disable state we'll update the toolbar button with.
  const additionalButtons =
    signatures.status === "not_signed"
      ? [
          {
            ...finishButton,
            disabled: false,
          },
          saveButton,
        ]
      : [resetButton, saveButton];

  instance.setToolbarItems([...initialToolbarItems, ...additionalButtons]);
}

const initialToolbarItems = [
  { type: "sidebar-thumbnails" },
  { type: "sidebar-bookmarks" },
  { type: "sidebar-signatures" },
  { type: "zoom-in" },
  { type: "zoom-out" },
  { type: "spacer" },
  { type: "export-pdf" },
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
