import React from "react";
import ReactDOM from "react-dom";
import MyApp from "./app/app";

export function load(defaultConfiguration) {
  const hostElement = document.createElement("div");

  document.body.appendChild(hostElement);

  return new Promise((resolve) => {
    ReactDOM.render(
      <MyApp
        PSPDFKitConfiguration={defaultConfiguration}
        PSPDFKitLoaded={resolve}
      />,
      hostElement
    );
  });
}
