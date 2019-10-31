import React from "react";

function reset() {
  // All of our example related localStorage items are prefixed with `examples/`
  Object.keys(localStorage)
    .filter(key => key.indexOf("examples/") === 0)
    .map(key => localStorage.removeItem(key));
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
          width: 60%;
          margin-left: 20%;
          margin-right: 20%;
          padding: 6px 10px;
          cursor: pointer;
          background: #f7e5e4;
          border-radius: 3px;
          border: 1px #cc3505 solid;
          color: #cc3505;
          font-weight: 500;
        }
      `}</style>
    </React.Fragment>
  );
}
