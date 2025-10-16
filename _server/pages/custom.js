import React from "react";

import CustomExample from "../components/example/custom";
import StandaloneDocumentButton from "../components/buttons/standalone-document-button";

export default function CustomExamplePage({
  customDocument,
  showCustomPdf,
  currentBackend,
}) {
  if (!customDocument) {
    // If there is no custom PDF set but we're on `/custom`, we want to show
    // a button to open a PDF with Nutrient Web SDK in standalone mode
    return (
      <React.Fragment>
        <div className="custom-pdf-page">
          <div className="message">
            <p>Please open a PDF to try out Nutrient Web SDK</p>
            <StandaloneDocumentButton showCustomPdf={showCustomPdf} />
          </div>
        </div>
        <style jsx>
          {`
            .custom-pdf-page {
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f6f8fa;
            }
            .message {
              width: 100%;
              max-width: 400px;
              background: #fff;
              padding: 25px;
              border-radius: 5px;
              text-align: center;
              font-weight: bold;
            }
          `}
        </style>
      </React.Fragment>
    );
  } else {
    return (
      <CustomExample
        customDocument={customDocument}
        currentBackend={currentBackend}
      />
    );
  }
}
