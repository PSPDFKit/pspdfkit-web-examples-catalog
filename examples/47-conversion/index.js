import Router from "next/router";
import PSPDFKit from "@nutrient-sdk/viewer";
import React from "react";

import styles from "./static/styles";
import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

let instance = null;

let defaultConfiguration = null;

let globalSetIsServer;

export function load(_defaultConfiguration) {
  globalSetIsServer && globalSetIsServer(!!_defaultConfiguration.authPayload);

  // Nutrient Web SDK freezes the Options object to prevent changes after the first load
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  defaultConfiguration = _defaultConfiguration;

  // Use the `processorEngine` query param to set the configuration.
  if (
    typeof Router.query.processorEngine !== "undefined" &&
    Router.query.processorEngine !== "undefined"
  ) {
    const { processorEngine } = Router.query;

    let forcedProcessorEngine = Array.isArray(processorEngine)
      ? processorEngine[processorEngine.length - 1]
      : processorEngine;

    if (forcedProcessorEngine === "smallerSize") {
      defaultConfiguration.processorEngine =
        PSPDFKit.ProcessorEngine.smallerSize;
    } else if (forcedProcessorEngine === "fasterProcessing") {
      defaultConfiguration.processorEngine =
        PSPDFKit.ProcessorEngine.fasterProcessing;
    } else {
      console.warn(
        `processorEngine query value '${forcedProcessorEngine}' is unknown.`,
      );
    }
  }

  return PSPDFKit.load(defaultConfiguration).then((_instance) => {
    instance = _instance;

    return instance;
  });
}

// By exporting a CustomContainer, we can customize the HTML structure that is
// used by the catalog app.
// We do this so that we can show the top bar and fill it with some example
// tools.
export const CustomContainer = React.forwardRef((_, ref) => {
  const [isServer, setIsServer] = React.useState(false);

  React.useEffect(() => {
    if (defaultConfiguration && defaultConfiguration.authPayload && !isServer) {
      setIsServer(true);
    }

    if (!globalSetIsServer) {
      globalSetIsServer = setIsServer;
    }
  }, [setIsServer, isServer]);

  const downloadExportedDocument = React.useCallback(
    (arrayBuffer, fileBaseName, extension = "pdf") => {
      const blob = new Blob([arrayBuffer], {
        type: mimeForExtension(extension),
      });

      const objectUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      const fileName = fileBaseName.endsWith(".pdf")
        ? `${fileBaseName.substring(0, fileBaseName.length - 4)}.${extension}`
        : `${fileBaseName}.${extension}`;

      a.href = objectUrl;
      a.style.display = "none";
      a.download = fileName;
      a.setAttribute("download", fileName);

      document.body.append(a);
      a.click();

      // Cleaning up immediately leads to WebkitBlobResource
      // error 1, so we need to wait before doing so.
      // https://stackoverflow.com/a/60039120/1526894
      window.setTimeout(function () {
        window.URL.revokeObjectURL(objectUrl);
        a.remove();
      }, 1000);
    },
    [],
  );

  const upload = (event) => {
    if (!event.target.files.length) {
      return;
    }

    const file = event.target.files[0];

    instance && PSPDFKit.unload(".viewerContainer");

    const reader = new FileReader();

    reader.onload = function (e) {
      const markupMode = document.querySelector(".markupMode").value?.trim();

      PSPDFKit.load({
        ...defaultConfiguration,
        container: ".viewerContainer",
        enableHistory: true,
        toolbarItems: PSPDFKit.defaultToolbarItems
          .reduce((acc, item) => {
            if (item.type === "polyline") {
              return acc.concat([item, { type: "undo" }, { type: "redo" }]);
            }

            return acc.concat([item]);
          }, [])
          .concat([{ type: "content-editor" }]),
        document: e.target.result,
        ...(markupMode
          ? {
              officeConversionSettings: {
                documentMarkupMode: markupMode,
              },
            }
          : null),
      }).then((_instance) => {
        instance = _instance;
      });
    };

    reader.readAsArrayBuffer(file);
  };

  const availableTools = [
    {
      isSupported: (isServer) => !isServer,
      tool: {
        name: "Load",
        onPress: (filename) => {
          instance && PSPDFKit.unload(".viewerContainer");

          PSPDFKit.load({
            ...defaultConfiguration,
            container: ".viewerContainer",
            enableHistory: true,
            toolbarItems: PSPDFKit.defaultToolbarItems
              .reduce((acc, item) => {
                if (item.type === "polyline") {
                  return acc.concat([item, { type: "undo" }, { type: "redo" }]);
                }

                return acc.concat([item]);
              }, [])
              .concat([{ type: "content-editor" }]),
            document: `${location.pathname}/static/${filename}`,
          }).then((_instance) => {
            instance = _instance;
          });
        },
      },
    },
    {
      isSupported: (isServer) => !isServer,
      tool: {
        name: "Load with markup mode",
        onPress: (filename) => {
          instance && PSPDFKit.unload(".viewerContainer");

          const markupMode = document
            .querySelector(".markupMode")
            .value?.trim();

          PSPDFKit.load({
            ...defaultConfiguration,
            container: ".viewerContainer",
            enableHistory: true,
            toolbarItems: PSPDFKit.defaultToolbarItems
              .reduce((acc, item) => {
                if (item.type === "polyline") {
                  return acc.concat([item, { type: "undo" }, { type: "redo" }]);
                }

                return acc.concat([item]);
              }, [])
              .concat([{ type: "content-editor" }]),
            document: `${location.pathname}/static/${filename}`,
            ...(markupMode
              ? {
                  officeConversionSettings: {
                    documentMarkupMode: markupMode,
                  },
                }
              : null),
          }).then((_instance) => {
            instance = _instance;
          });
        },
      },
    },
    {
      isSupported: (isServer) => !isServer,
      tool: {
        name: "Download as PDF",
        onPress: (filename) => {
          PSPDFKit.convertToPDF({
            ...defaultConfiguration,
            document: `${location.pathname}/static/${filename}`,
          }).then((buffer) => downloadExportedDocument(buffer, filename));
        },
      },
    },
    {
      isSupported: (isServer) => !isServer,
      tool: {
        name: "Download with markup mode",
        onPress: (filename) => {
          const markupMode = document
            .querySelector(".markupMode")
            .value?.trim();

          PSPDFKit.convertToPDF(
            {
              ...defaultConfiguration,
              document: `${location.pathname}/static/${filename}`,
            },
            null,
            markupMode
              ? {
                  documentMarkupMode: markupMode,
                }
              : null,
          ).then((buffer) => downloadExportedDocument(buffer, filename));
        },
      },
    },
    {
      isSupported: (isServer) => !isServer,
      tool: {
        name: "Download as PDF/A",
        options: PSPDFKit.Conformance,
        onSelect: (filename, conformance) => {
          PSPDFKit.convertToPDF(
            {
              ...defaultConfiguration,
              document: `${location.pathname}/static/${filename}`,
            },
            conformance,
          ).then((buffer) => downloadExportedDocument(buffer, filename));
        },
      },
    },
    {
      isSupported: (isServer) => !isServer,
      tool: {
        name: "Markup mode",
        options: ["noMarkup", "simpleMarkup", "allMarkup", "original"],
        onSelect: () => {},
        classname: "markupMode",
      },
    },
  ];

  const tools = availableTools
    .filter(({ isSupported }) => isSupported(isServer))
    .map(({ tool }) => tool);

  const exportToOfficeTool = {
    isSupported: () => true,
    tool: {
      name: "Export to Office",
      options: PSPDFKit.OfficeDocumentFormat,
      onSelect: (filename, format) => {
        instance &&
          instance
            .exportOffice({ format })
            .then((buffer) =>
              downloadExportedDocument(buffer, filename, format),
            );
      },
    },
  };

  return (
    <div className="customContainer">
      <>
        <div className="topBar">
          {!isServer && (
            <fieldset key="upload" data-control-type="upload">
              <legend>Upload Office or PDF document</legend>
              <div>
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".pdf,.docx,.pptx,.xlsx"
                  onChange={upload}
                />
              </div>
            </fieldset>
          )}
          <fieldset key="exportToOffice" data-control-type="exportToOffice">
            <legend>Export to Office</legend>
            <div>
              <select
                key={exportToOfficeTool.tool.name}
                name={exportToOfficeTool.tool.name}
                onChange={(event) => {
                  event.target.value &&
                    exportToOfficeTool.tool.onSelect(
                      "document.pdf",
                      event.target.value,
                    );
                }}
              >
                <option value="">{exportToOfficeTool.tool.name}</option>
                {Object.values(exportToOfficeTool.tool.options).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          {!isServer &&
            documents.map((document) => (
              <fieldset key={document.filename}>
                <legend>{document.name}</legend>
                <div>
                  {tools
                    .filter((tool) => document.tools.includes(tool.name))
                    .map((tool) =>
                      tool.onPress ? (
                        <button
                          key={tool.name}
                          onClick={() => tool.onPress(document.filename)}
                        >
                          {tool.name}
                        </button>
                      ) : (
                        <select
                          key={tool.name}
                          name={tool.name}
                          onChange={(event) => {
                            event.target.value &&
                              tool.onSelect(
                                document.filename,
                                event.target.value,
                              );
                          }}
                          className={tool.classname}
                        >
                          <option value="">{tool.name}</option>
                          {Object.values(tool.options).map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      ),
                    )}
                </div>
              </fieldset>
            ))}
          {!isServer && defaultConfiguration && (
            <p>Processor Engine: {defaultConfiguration.processorEngine}</p>
          )}
        </div>

        <div className="viewerContainer" ref={ref} />
      </>
      <style jsx>{styles}</style>
    </div>
  );
});

const documents = [
  {
    filename: "example.docx",
    name: "DOCX",
    tools: ["Load", "Download as PDF", "Download as PDF/A"],
  },
  {
    filename: "markup-mode.docx",
    name: "DOCX with markup",
    tools: [
      "Load with markup mode",
      "Download with markup mode",
      "Markup mode",
    ],
  },
  {
    filename: "example.pptx",
    name: "PPTX",
    tools: ["Load", "Download as PDF", "Download as PDF/A"],
  },
  {
    filename: "example.xlsx",
    name: "XLSX",
    tools: ["Load", "Download as PDF", "Download as PDF/A"],
  },
];

function mimeForExtension(extension) {
  switch (extension) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    default:
      return "application/octet-stream";
  }
}
