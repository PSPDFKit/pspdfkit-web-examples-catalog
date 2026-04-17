import PSPDFKit from "@nutrient-sdk/viewer";
import React from "react";

import styles from "./static/styles";
import warningStyles from "./static/warningStyles.js";

let globalSetIsServer;
let globalSetHasAIA;

export function load(defaultConfiguration) {
  // For Standalone mode, authPayload will be undefined.
  const isServerMode = !!defaultConfiguration.authPayload;
  globalSetIsServer && globalSetIsServer(isServerMode);

  // Check for AI Assistant availability.
  const hasAIA = !!defaultConfiguration.aiAssistant;
  globalSetHasAIA && globalSetHasAIA(hasAIA);

  // Only proceed with loading if we have AIA.
  if (!hasAIA) {
    return;
  }

  return PSPDFKit.load({
    ...defaultConfiguration,
    enableHistory: true,
    locale: "ar",
    toolbarItems: defaultConfiguration.toolbarItems.reduce((acc, item) => {
      // Let just replace the print item with AI Assistant.
      if (item.type === "print") {
        return acc.concat([{ type: "ai-assistant" }]);
      }

      return acc.concat([item]);
    }, []),
  }).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
}

// By exporting a CustomContainer, we can customize the HTML structure that is
// used by the catalog app.
// We do this so that we can show the top bar and fill it with some example
// tools.
export const CustomContainer = React.forwardRef((instance, ref) => {
  const [setIsServer] = React.useState(false);
  const [hasAIA, setHasAIA] = React.useState(false);

  React.useEffect(() => {
    globalSetIsServer = setIsServer;
  }, [setIsServer]);

  React.useEffect(() => {
    globalSetHasAIA = setHasAIA;
  }, [setHasAIA]);

  const AIAWarning = (
    <div className="phases__phase">
      <style jsx>{warningStyles}</style>
      <div className="info">
        <div className="info-content">
          <span className="info-icon">
            <InlineSvgComponent src={require("./static/information.js")} />
          </span>
          <h2>Requires AI Assistant</h2>
          <p>{exampleRequiresAIAMessage}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100%" }}>
      <style jsx>{styles}</style>
      {!hasAIA && AIAWarning}
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

const exampleRequiresAIAMessage =
  "This example requires the Nutrient AI Assistant service to function. The example works in both Server and Standalone modes when AI Assistant is enabled.";
