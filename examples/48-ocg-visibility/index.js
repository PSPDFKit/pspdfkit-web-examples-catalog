import PSPDFKit from "@nutrient-sdk/viewer";
import React from "react";

import styles from "./static/styles";

let globalSetIsServer;
let instance;

export async function load(defaultConfiguration) {
  // PSPDFKit.Configuration#authPayload is a Server only property.
  if (defaultConfiguration.authPayload) {
    globalSetIsServer && globalSetIsServer(true);

    return;
  }

  globalSetIsServer && globalSetIsServer(false);

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: [
      { type: "sidebar-layers" },
      { type: "spacer" },
      { type: "export-pdf" },
    ],
    initialViewState: new PSPDFKit.ViewState({
      sidebarMode: PSPDFKit.SidebarMode.LAYERS,
    }),
  }).then(async (_instance) => {
    instance = _instance;

    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
}

/**
 * This section is not relevant for the demo. This is just a UI implementation of message that we show
 * if the user is running the server setup in our catalog examples to tell the user that
 * we don't support this feature in server mode. You can ignore this.
 */
export const CustomContainer = React.forwardRef((props, ref) => {
  const [isServer, setIsServer] = React.useState(false);

  React.useEffect(() => {
    globalSetIsServer = setIsServer;
  }, [setIsServer]);

  const ServerWarning = (
    <div className="phases__phase">
      <style jsx>{styles}</style>
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
      <div
        id="nutrient"
        className="container"
        ref={ref}
        style={{ height: "100%" }}
      ></div>
      {isServer ? ServerWarning : null}
    </div>
  );
});

const InlineSvgComponent = ({ src, ...otherProps }) => {
  return <span {...otherProps} dangerouslySetInnerHTML={{ __html: src }} />;
};

const exampleNotSupportedMessage =
  "OCG Layers Visibility is only supported on Nutrient Web SDK in standalone mode.";
