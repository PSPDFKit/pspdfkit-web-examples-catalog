import PSPDFKit from "@nutrient-sdk/viewer";
import React from "react";

const DEFAULT_DOCUMENT_URL =
  "https://public-solutions-engineering-bucket.s3.eu-central-1.amazonaws.com/docs/Linearized-iOS-QuickStart-Guides.pdf";

let documentUrl = DEFAULT_DOCUMENT_URL;
let allowLinearizedLoading = true;
let globalSetIsServerMode = null;

function isServerMode(defaultConfiguration) {
  return Boolean(defaultConfiguration.authPayload);
}

export function load(defaultConfiguration) {
  const serverMode = isServerMode(defaultConfiguration);

  globalSetIsServerMode?.(serverMode);

  if (serverMode) {
    return null;
  }

  return PSPDFKit.load({
    ...defaultConfiguration,
    document: documentUrl,
    tempStorage: "opfs",
    allowLinearizedLoading,
  }).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
}

export const CustomContainer = React.forwardRef((props, ref) => {
  const [url, setUrl] = React.useState(documentUrl);
  const [linearized, setLinearized] = React.useState(allowLinearizedLoading);
  const [isServerMode, setIsServerMode] = React.useState(false);

  globalSetIsServerMode = setIsServerMode;

  React.useEffect(() => {
    return () => {
      if (globalSetIsServerMode === setIsServerMode) {
        globalSetIsServerMode = null;
      }
    };
  }, []);

  const applySettings = React.useCallback(() => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      window.alert("Please enter a document URL.");
      return;
    }

    documentUrl = trimmedUrl;
    allowLinearizedLoading = linearized;
    props.onForceReRender();
  }, [linearized, props, url]);

  if (isServerMode) {
    return (
      <div className="unsupported-mode" ref={ref}>
        <div className="panel panel--centered">
          <h2>Standalone only</h2>
          <p>
            OPFS is only available in standalone mode. Switch the catalog backend
            to Standalone to test this example.
          </p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="opfs-example">
      <div className="panel">
        <label className="field" htmlFor="opfs-url-input">
          <span>Document URL</span>
          <input
            id="opfs-url-input"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/document.pdf"
          />
        </label>

        <div className="controls-row">
          <label className="checkbox" htmlFor="opfs-linearized-toggle">
            <input
              id="opfs-linearized-toggle"
              type="checkbox"
              checked={linearized}
              onChange={(event) => setLinearized(event.target.checked)}
            />
            <span>Allow linearized loading</span>
          </label>

          <div className="actions">
            <button type="button" onClick={applySettings}>
              Reload with OPFS
            </button>
          </div>
        </div>
      </div>

      <div className="viewer" ref={ref} />

      <style jsx>{styles}</style>
    </div>
  );
});

const styles = `
  .opfs-example,
  .unsupported-mode {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f6f8fa;
  }

  .panel {
    position: relative;
    z-index: 1;
    padding: 8px 12px;
    background: #ffffff;
    border-bottom: 1px solid rgba(50, 56, 62, 0.12);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .panel--centered {
    margin: auto;
    max-width: 420px;
    border: 1px solid rgba(50, 56, 62, 0.12);
    border-radius: 8px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-weight: 500;
  }

  .field span {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #606671;
  }

  .field input {
    width: 100%;
    min-width: 0;
    padding: 8px 10px;
    border: 1px solid rgba(50, 56, 62, 0.18);
    border-radius: 6px;
    font-size: 14px;
  }

  .controls-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    min-height: 36px;
  }

  .checkbox input {
    margin: 0;
  }

  .actions {
    display: flex;
    justify-content: flex-start;
  }

  .actions button {
    margin-top: 0;
    padding: 8px 12px;
    background: #4537de;
    color: #ffffff;
  }

  .viewer {
    flex: 1;
    min-height: 0;
  }

  @media (prefers-color-scheme: dark) {
    .opfs-example,
    .unsupported-mode {
      background: #32383e;
      color: #f6f8fa;
    }

    .panel {
      background: #32383e;
      border-bottom-color: rgba(255, 255, 255, 0.12);
    }

    .panel--centered {
      border-color: rgba(255, 255, 255, 0.12);
    }

    .field span {
      color: #c9d0da;
    }

    .field input {
      background: #23272d;
      border-color: rgba(255, 255, 255, 0.12);
      color: #f6f8fa;
    }
  }
`;
