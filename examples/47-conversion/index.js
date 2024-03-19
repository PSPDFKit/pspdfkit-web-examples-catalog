import PSPDFKit from "pspdfkit";

import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

let instance = null;

let defaultConfiguration = null;

export function load(_defaultConfiguration) {
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

  const tools = [
    {
      name: "Load",
      onPress: (filename) => {
        instance && PSPDFKit.unload(".viewerContainer");

        // PSPDFKit.Configuration#authPayload is a Server only property.
        // We check for its presence to determine if content-editor should be added
        const items = defaultConfiguration.toolbarItems.concat(
          defaultConfiguration.authPayload ? [] : [{ type: "content-editor" }]
        );

        PSPDFKit.load({
          ...defaultConfiguration,
          container: ".viewerContainer",
          enableHistory: true,
          toolbarItems: items.reduce((acc, item) => {
            if (item.type === "polyline") {
              return acc.concat([item, { type: "undo" }, { type: "redo" }]);
            }

            return acc.concat([item]);
          }, []),
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

  return (
    <div className="customContainer">
      <div className="topBar">
        <fieldset key="processorEngine" data-control-type="processorEngine">
          <legend>Processor engine</legend>
          <div>
            <select
              name="processorEngine"
              onChange={(event) => {
                setProcessorEngine(event.target.value);
              }}
              defaultValue={processorEngine}
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
                        tool.onSelect(document.filename, event.target.value);
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
      </div>

      <div className="viewerContainer" ref={ref} />

      <style jsx>{`
        .customContainer {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .topBar {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: center;
          background: #32373d;
          color: white;
          font-family: Indivisible, -apple-system, BlinkMacSystemFont,
            "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
            "Helvetica Neue", sans-serif;
        }

        .topBar fieldset {
          border: none;
          margin: 0 10px;
          display: flex;
          flex-direction: column;
          border: 1px solid gray !important;
          border-radius: 0.25rem;
          padding: 0 0.5rem;
        }

        fieldset[data-control-type="processorEngine"] > div {
          flex: 1;
        }

        .topBar fieldset div {
          display: flex;
          flex-direction: row;
          justify-content: center;
          padding: 0 0 0.5rem;
          gap: 0.5rem;
        }

        .topBar legend {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 5px;
          color: white;
          padding: 0.25rem 0;
        }

        .topBar button {
          display: block;
          margin: 0;
          padding: 5px 10px;
          border: 1px solid #ddd;
          border-radius: 3px;
          background: #eee;
          cursor: pointer;
        }

        .topBar button:hover {
          background: #ddd;
        }

        .viewerContainer {
          height: 100%;
          flex-grow: 1;
        }

        @media (prefers-color-scheme: light) {
          .topBar {
            background: #fdf8f2;
            color: black;
          }

          .topBar legend {
            color: black;
          }

          .topBar button {
            background: #fdf8f2;
            border: 1px solid #222222;
          }

          .topBar button:hover {
            background: #222222;
          }
        }
      `}</style>
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
