import React from "react";
import { createRoot } from "react-dom/client";

import MyApp from "./app/app";

export function load(defaultConfiguration) {
  const hostElement = document.createElement("div");

  document.body.appendChild(hostElement);
  const root = createRoot(hostElement);

  return new Promise((resolve) => {
    root.render(
      <MyApp
        PSPDFKitConfiguration={defaultConfiguration}
        PSPDFKitLoaded={resolve}
      />,
      hostElement
    );
  });
}
