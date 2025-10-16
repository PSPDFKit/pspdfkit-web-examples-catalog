import PSPDFKit from "@nutrient-sdk/viewer";
import React from "react";

import styles from "./static/styles";
import warningStyles from "./static/warningStyles.js";

let globalSetIsServer;

export async function load(defaultConfiguration) {
  if (defaultConfiguration.authPayload) {
    globalSetIsServer && globalSetIsServer(true);

    return;
  }

  globalSetIsServer && globalSetIsServer(false);

  const toolbarItems = [
    defaultConfiguration.toolbarItems[0],
    defaultConfiguration.toolbarItems[1],
    defaultConfiguration.toolbarItems[2],
  ];

  const instance = await PSPDFKit.load(
    {
      ...defaultConfiguration,
      enableHistory: true,
      toolbarItems,
    },
    []
  );
  instance.setToolbarItems((items) => {
    function downloadDocument(url, fileName) {
      const a = document.createElement("a");

      a.href = url;
      a.style.display = "none";
      a.download = fileName;
      a.setAttribute("download", fileName);

      const body = document.body;

      if (body) {
        body.appendChild(a);
        a.click();

        return () => {
          const body = document.body;

          if (body) {
            body.removeChild(a);
          }
        };
      } else {
        return () => {};
      }
    }

    async function exportOffice(format) {
      const buffer = await instance.exportOffice({ format });

      if (!buffer) {
        return;
      }

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const fileName = `document.${format}`;

      const objectUrl = window.URL.createObjectURL(blob);
      downloadDocument(objectUrl, fileName);
      window.URL.revokeObjectURL(objectUrl);
    }

    items.push(
      {
        type: "custom",
        id: "export-office-word",
        title: "Export Word",
        onPress: () => exportOffice("docx"),
      },
      {
        type: "custom",
        id: "export-office-powerpoint",
        title: "Export PowerPoint",
        onPress: () => exportOffice("pptx"),
      },
      {
        type: "custom",
        id: "export-office-excel",
        title: "Export Excel",
        onPress: () => exportOffice("xlsx"),
      }
    );

    return items;
  });

  console.log("Nutrient Web SDK successfully loaded!!", instance);
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
  "The Export Office example only supports Nutrient Web SDK in standalone mode.";
