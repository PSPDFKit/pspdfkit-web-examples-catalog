import React from "react";

import FileInputButton from "./file-input-button";

export default function StandaloneDocumentButton({ showCustomPdf }) {
  const openUrl = () => {
    const url = window.prompt("Enter a document URL");

    if (!url || !url.trim()) {
      return;
    }

    showCustomPdf(url.trim(), "standalone");
  };

  return (
    <React.Fragment>
      <FileInputButton
        onChange={(file) => {
          showCustomPdf(file, "standalone");
        }}
      >
        Open Document
      </FileInputButton>

      <button className="open-url-button" type="button" onClick={openUrl}>
        Open URL
      </button>

      <style jsx>{`
        .open-url-button {
          display: block;
          width: 100%;
          padding: 10px 12px;
          margin-top: 10px;
          font-weight: 500;
          font-size: 12px;
          background: #4484e3;
          border-radius: 5px;
          color: #fff;
          text-align: center;
          cursor: pointer;
          line-height: 1em;
          border: none;
        }

        .open-url-button:hover,
        .open-url-button:focus {
          background: #4b8cec;
        }
      `}</style>
    </React.Fragment>
  );
}
