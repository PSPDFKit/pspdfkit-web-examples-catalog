import PSPDFKit from "pspdfkit";

import styles from "./static/styles";
import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

let instance = null;

let defaultConfiguration = null;

let globalSetIsServer;

export function load(_defaultConfiguration) {
  if (_defaultConfiguration.authPayload) {
    globalSetIsServer && globalSetIsServer(true);

    return;
  }

  globalSetIsServer && globalSetIsServer(false);

  // PSPDFKit freezes the Options object to prevent changes after the first load
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  defaultConfiguration = _defaultConfiguration;

  return PSPDFKit.load(defaultConfiguration).then((_instance) => {
    instance = _instance;

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
    if (defaultConfiguration.authPayload && !isServer) {
      setIsServer(true);
    }

    if (!globalSetIsServer) {
      globalSetIsServer = setIsServer;
    }
  }, [setIsServer, isServer]);

  const [processorEngine, setProcessorEngine] = React.useState(
    PSPDFKit.ProcessorEngine.fasterProcessing
  );

  const downloadExportedDocument = React.useCallback(
    (arrayBuffer, fileBaseName) => {
      const blob = new Blob([arrayBuffer], {
        type: "application/pdf",
      });

      const objectUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      const fileName = `${fileBaseName}.pdf`;

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
    []
  );

  const upload = (event) => {
    if (!event.target.files.length) {
      return;
    }

    const file = event.target.files[0];

    instance && PSPDFKit.unload(".viewerContainer");

    const reader = new FileReader();

    reader.onload = function (e) {
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
        processorEngine,
      }).then((_instance) => {
        instance = _instance;
      });
    };

    reader.readAsArrayBuffer(file);
  };

  const tools = [
    {
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
          processorEngine,
        }).then((_instance) => {
          instance = _instance;
        });
      },
    },
    {
      name: "Download as PDF",
      onPress: (filename) => {
        PSPDFKit.convertToPDF({
          ...defaultConfiguration,
          document: `${location.pathname}/static/${filename}`,
          processorEngine,
        }).then((buffer) => downloadExportedDocument(buffer, filename));
      },
    },
    {
      name: "Download as PDF/A",
      options: PSPDFKit.Conformance,
      onSelect: (filename, conformance) => {
        PSPDFKit.convertToPDF(
          {
            ...defaultConfiguration,
            document: `${location.pathname}/static/${filename}`,
            processorEngine,
          },
          conformance
        ).then((buffer) => downloadExportedDocument(buffer, filename));
      },
    },
  ];

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
    <div className="customContainer">
      {!isServer ? (
        <>
          <div className="topBar">
            <fieldset key="upload" data-control-type="upload">
              <legend>Upload Office document</legend>
              <div>
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".docx,.pptx,.xlsx"
                  onChange={upload}
                />
              </div>
            </fieldset>
            {documents.map((document) => (
              <fieldset key={document.filename}>
                <legend>{document.name}</legend>
                <div>
                  {tools.map((tool) =>
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
                              event.target.value
                            );
                        }}
                      >
                        <option value="">Download as PDF/A</option>
                        {Object.values(tool.options).map((conformance) => (
                          <option key={conformance} value={conformance}>
                            {conformance}
                          </option>
                        ))}
                      </select>
                    )
                  )}
                </div>
              </fieldset>
            ))}
            <fieldset key="processorEngine" data-control-type="processorEngine">
              <legend>Processor engine</legend>
              <div>
                <select
                  name="processorEngine"
                  onChange={(event) => {
                    setProcessorEngine(event.target.value);
                  }}
                  defaultValue={processorEngine}
                  disabled
                  title="Processor engine toggling currently disabled in the example."
                  style={{ cursor: "help" }}
                >
                  <option
                    value={PSPDFKit.ProcessorEngine.fasterProcessing}
                    key={PSPDFKit.ProcessorEngine.fasterProcessing}
                  >
                    Faster processing (AOT)
                  </option>
                  <option
                    value={PSPDFKit.ProcessorEngine.smallerSize}
                    key={PSPDFKit.ProcessorEngine.smallerSize}
                  >
                    Smaller size (JIT)
                  </option>
                </select>
              </div>
            </fieldset>
          </div>

          <div className="viewerContainer" ref={ref} />
        </>
      ) : (
        ServerWarning
      )}
      <style jsx>{styles}</style>
    </div>
  );
});

const documents = [
  {
    filename: "example.docx",
    name: "DOCX",
  },
  {
    filename: "example.pptx",
    name: "PPTX",
  },
  {
    filename: "example.xlsx",
    name: "XLSX",
  },
];

const InlineSvgComponent = ({ src, ...otherProps }) => {
  return <span {...otherProps} dangerouslySetInnerHTML={{ __html: src }} />;
};

const exampleNotSupportedMessage =
  "This Document Conversion example only supports PSPDFKit for Web Standalone.";
