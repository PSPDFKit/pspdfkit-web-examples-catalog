import PSPDFKit from "@nutrient-sdk/viewer";
import React from "react";

import styles from "./static/styles";
import warningStyles from "./static/warningStyles.js";
import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

let instance = null;

let defaultConfiguration = null;

let globalSetIsServer;

const documents = [
  "FormsAndAnnotations.pdf",
  "FormsAndAnnotationsAnnotationOrder.pdf",
  "FormsAndAnnotationsColumnOrder.pdf",
  "FormsAndAnnotationsRowOrder.pdf",
];

export function load(_defaultConfiguration) {
  defaultConfiguration = _defaultConfiguration;

  if (defaultConfiguration.authPayload) {
    globalSetIsServer && globalSetIsServer(true);

    return;
  }

  globalSetIsServer && globalSetIsServer(false);

  // Nutrient Web SDK freezes the Options object to prevent changes after the first load
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  return PSPDFKit.load({
    ...defaultConfiguration,
    document: `${location.pathname}/static/${documents[0]}`,
    styleSheets: [`${location.pathname}/static/styles.css`],
  }).then((_instance) => {
    instance = _instance;

    dialog(
      instance,
      "Use the Tab key to navigate the form fields, and confirm that the order fields are navigated corresponds with the number next to each field. If the focused status of a form field is not clear, try to activate the form field with the Space or Enter key to confirm."
    );

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

  const tool = {
    name: "Load",
    onPress: (filename) => {
      instance && PSPDFKit.unload(".viewerContainer");

      instance = null;

      PSPDFKit.load({
        ...defaultConfiguration,
        container: ".viewerContainer",
        document: `${location.pathname}/static/${filename}`,
      }).then((_instance) => {
        instance = _instance;
      });
    },
  };

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
      {isServer ? (
        ServerWarning
      ) : (
        <>
          <div className="topBar">
            <label htmlFor="documents">Select document</label>
            <select
              name="documents"
              id="documents"
              onChange={(e) => tool.onPress(e.target.value)}
              defaultValue={documents[0]}
            >
              {documents.map((document) => (
                <option value={document} key={document}>
                  {document}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
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
  "Tab order is only supported on Nutrient Web SDK in standalone mode.";

export function dialog(instance, text) {
  const p = document.createElement("p");
  p.textContent = text;
  const button = document.createElement("button");
  button.textContent = "OK";
  button.addEventListener("click", () => {
    instance.removeCustomOverlayItem("dialog");
  });
  const dialogContent = document.createElement("div");
  dialogContent.appendChild(p);
  dialogContent.appendChild(button);
  dialogContent.classList.add("dialog");
  const { width, height } = instance.pageInfoForIndex(0);
  dialogContent.style.width = `${width / 2}px`;
  instance.setCustomOverlayItem(
    new PSPDFKit.CustomOverlayItem({
      id: "dialog",
      node: dialogContent,
      pageIndex: 0,
      position: new PSPDFKit.Geometry.Point({ x: width / 2, y: height / 4 }),
    })
  );
}
