import React from "react";
import PSPDFKit from "@nutrient-sdk/viewer";

import styles from "./static/styles.js";
import warningStyles from "./static/warningStyles.js";

let globalSetIsServer;
let instance = null;

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

  // Process the document via Build API and load the resulting document.
  const processedDocument = await processDocument(
    defaultConfiguration.document
  );

  instance = await PSPDFKit.load({
    ...defaultConfiguration,
    document: processedDocument,
  });

  console.log("Nutrient Web SDK successfully loaded!!", instance);

  return instance;
}

async function processDocument(documentUrl) {
  const document = await (await fetch(documentUrl)).arrayBuffer();

  // Request the auth token from the backend to authenticate the Build API request.
  const authResponse = await fetch(
    `/api/create-auth-token?backend=${backend}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({}),
    }
  );

  if (!authResponse.ok) {
    throw new Error("Failed to create auth token");
  }

  const authPayload = await authResponse.json();
  console.log(`Using auth token: ${authPayload.jwt}`);

  // Perform the Build API request.
  // The actual processing is performed on the Document Engine.
  // No code changes are required to perform the requests via the DWS API, the only difference is that you need
  // access token for the DWS API (see implementation of the /api/create-auth-token endpoint in this example).
  return await PSPDFKit.build(
    // Authorization for performing the request on the backend from the frontend.
    { jwt: authPayload.jwt },
    // Instructions for the processing request.
    {
      parts: [
        // Use first input as the first part of the final document.
        { file: "document" },
        // Use a sample DOCX document served from URL as the second part of the final document.
        {
          file: {
            url: "https://www.nutrient.io/api/assets/downloads/samples/docx/document.docx",
          },
        },
      ],
    },
    // Inputs required by the request that should be uploaded together with the instructions.
    [{ name: "document", content: document }]
  );
}

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
        id="pspdfkit"
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
