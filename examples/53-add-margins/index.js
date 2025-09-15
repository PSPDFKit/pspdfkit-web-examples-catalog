import PSPDFKit from "@nutrient-sdk/viewer";
import React from "react";

import styles from "./static/styles";
import warningStyles from "./static/warningStyles.js";

let instance = null;

let globalSetIsServer;

export function load(defaultConfiguration) {
  if (defaultConfiguration.authPayload) {
    globalSetIsServer && globalSetIsServer(true);

    return;
  }

  globalSetIsServer && globalSetIsServer(false);

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: [
      { type: "sidebar-thumbnails" },
      { type: "zoom-in" },
      { type: "zoom-out" },
      { type: "spacer" },
      { type: "export-pdf" },
      {
        type: "custom",
        title: "Increase margins",
        onPress() {
          instance.applyOperations([
            {
              type: "addPageMargins",
              margins: new PSPDFKit.Geometry.Inset({
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
              }),
            },
          ]);
        },
      },
      {
        type: "custom",
        title: "Reduce margins",
        onPress() {
          instance.applyOperations([
            {
              type: "addPageMargins",
              margins: new PSPDFKit.Geometry.Inset({
                top: -10,
                right: -10,
                bottom: -10,
                left: -10,
              }),
            },
          ]);
        },
      },
    ],
  }).then(async (_instance) => {
    instance = _instance;

    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
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
  "The Add Page Margins example only supports Nutrient Web SDK in standalone mode.";
