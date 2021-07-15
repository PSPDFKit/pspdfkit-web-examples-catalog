import React from "react";

function reset() {
  // All of our example related localStorage items are prefixed with `examples/`
  Object.keys(localStorage)
    .filter((key) => key.indexOf("examples/") === 0)
    .map((key) => localStorage.removeItem(key));
  // And finally reload everything to hard-reset
  location.href = "/";
}

export default function ResetButton() {
  return (
    <React.Fragment>
      <button onClick={reset} aria-label="Restart application">
        Reset
      </button>
      <style jsx>{`
        button {
          width: 100%;
          max-width: 480px;
          padding: 8px 0;
          margin: 0;
          cursor: pointer;
          border-radius: 5px;
          font-weight: 500;
          background: #c5170e;
          color: white;
        }

        @media (min-width: 992px) {
          button {
            max-width: 210px;
          }
        }
      `}</style>
    </React.Fragment>
  );
}
