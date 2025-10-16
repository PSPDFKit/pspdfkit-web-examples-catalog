/* eslint-disable compat/compat */

import Router from "next/router";
import PSPDFKit from "@nutrient-sdk/viewer";

import { resetExamples } from "../buttons/reset-button";

const ID = "i"; // Name of the query param where we store the server ID
const SERVER_DOCUMENT_ID_REGEX = /([a-zA-Z0-9-_.]+)/;

export function getInitialBackend() {
  // When we have a `mode` query param, we force the specified backend.
  if (
    typeof Router.query.mode !== "undefined" &&
    Router.query.mode !== "undefined"
  ) {
    const { mode: queryMode, ...cleanQuery } = Router.query;

    let forcedMode = Array.isArray(queryMode)
      ? queryMode[queryMode.length - 1]
      : queryMode;

    if (forcedMode === "server" && typeof Router.query.i === "undefined") {
      Router.push({
        pathname: Router.pathname,
        query: { ...cleanQuery, mode: "server" },
      });
    } else if (
      forcedMode === "standalone" &&
      typeof Router.query.i !== "undefined"
    ) {
      Router.push({
        pathname: Router.pathname,
        query: { mode: "standalone" },
      });
    } else if (forcedMode !== "standalone" && forcedMode !== "server") {
      // Default to server
      forcedMode = "server";
      Router.push({
        pathname: Router.pathname,
        query: { ...cleanQuery, mode: "server" },
      });
    }

    return forcedMode;
  }

  // When we have a query param, the case is pretty clear. We have received a
  // link and need to recover the same backend.
  if (
    Router.query[ID] &&
    SERVER_DOCUMENT_ID_REGEX.test(Router.query[ID].toString())
  ) {
    return "server";
  }

  // If no query param is present, we consult the local storage. We store
  // properties in  the local storage whenever an example is loaded. This way we
  // can recover the last used method when we open another example.
  const lastUsedBackend = localStorage.getItem("examples/lastUsedBackend");

  if (lastUsedBackend) {
    return lastUsedBackend;
  }

  // By default, we fall back to the server backend
  return "server";
}

// We want to be able to restore documents whenever possible. To do this, we
// added several mechanics to persist the shareable document id. This function
// takes care of returning the valid document id in case it can be restored.
export function getPreviousDocumentId(name) {
  // When we have a query param, the case is pretty clear. We have received a
  // link and need to recover the document id
  if (Router.query[ID] && SERVER_DOCUMENT_ID_REGEX.test(Router.query[ID])) {
    return Router.query[ID];
  }

  // If no query param is present, we also consult the local storage.
  const lastUsedDocumentId = localStorage.getItem(
    `examples/${name}/lastUsedServerDocumentId`
  );

  if (lastUsedDocumentId) {
    return lastUsedDocumentId;
  }

  return null;
}

export async function load(container, name, backend, loadHook, fileName) {
  // Let's see if we can recover a document id
  const previousDocumentId = getPreviousDocumentId(name);

  let serverDocument;

  const toolbarItems = getDefaultToolbarItems();

  let defaultConfiguration = {
    container,
    toolbarItems,
    theme: PSPDFKit.Theme.AUTO,
    enableClipboardActions: true,
    enableHistory: true,
    enableRichText: () => true,
  };

  // Depending on the backend, we have to use different configuration options.
  switch (backend) {
    case "server": {
      const res = await fetch(`/server-document/${name}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          previousDocumentId,
          jwtParameters: window.jwtParameters,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      serverDocument = await res.json();

      const aiaUrl = getAIAUrl();

      Object.assign(defaultConfiguration, getDefaultOptions("server"), {
        authPayload: {
          jwt: serverDocument.jwt,
        },
        documentId: serverDocument.documentId,
        aiAssistant: aiaUrl
          ? {
              sessionId: "my-chat-session",
              jwt: serverDocument.aiaJwt,
              backendUrl: aiaUrl,
            }
          : undefined,
      });
      break;
    }
    case "standalone": {
      const aiaUrl = getAIAUrl();
      let aiaJwt;

      if (aiaUrl) {
        const res = await fetch("/generate-aia-jwt", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        aiaJwt = await res.json();
      }

      Object.assign(defaultConfiguration, getDefaultOptions("standalone"), {
        document: `/${name}/${fileName}`,
        processorEngine: PSPDFKit.ProcessorEngine.fasterProcessing,
        aiAssistant: aiaUrl
          ? {
              sessionId: "my-chat-session",
              jwt: aiaJwt.jwt,
              backendUrl: aiaUrl,
            }
          : undefined,
      });
      break;
    }
    default:
      throw new Error(
        "Unexpected backend encountered. Please contact support@nutrient.io"
      );
  }

  ensureProperSearchParams(serverDocument);

  // In addition to the search param, we also store the last used backend in
  // local storage. This makes it possible to recover when we switch examples.
  localStorage.setItem("examples/lastUsedBackend", backend);

  // In case of a server document, we also store the sharable id for this
  // example in local storage. This way, we can recover the same state when we
  // reopen the same example via the "root" URL.
  if (serverDocument) {
    localStorage.setItem(
      `examples/${name}/lastUsedServerDocumentId`,
      serverDocument.id
    );
  }

  const instance = await loadHook(defaultConfiguration);

  // We expose the instance as a global variable to make debugging in the
  // console easier.
  window.instance = instance;

  return {
    instance,
    serverDocument,
    instantUrl: serverDocument
      ? `${location.protocol}//${location.host}/${name}/${serverDocument.id}`
      : null,
  };
}

export function validatePSPDFKitVersion(version) {
  const VERSION_KEY = "ps-catalog/lib-version";
  const item = localStorage.getItem(VERSION_KEY);
  localStorage.setItem(VERSION_KEY, version);

  if (item !== version) {
    resetExamples();
  }
}

export function getDefaultOptions(backend) {
  switch (backend) {
    case "server":
      return {
        serverUrl: getServerUrl(),
        instant: Router.query.instant !== "false",
      };
    case "standalone":
      return {
        licenseKey: getLicenseKey(),
        dynamicFonts: getDynamicFontsUrl(),
      };
  }
}

export function getDynamicFontsUrl() {
  const locationProtocol = location.protocol;
  const locationHostname = location.hostname;
  const locationPort = location.port;

  let dynamicFontsURL = `${locationProtocol}//${locationHostname}`;

  if (locationPort) {
    dynamicFontsURL += `:${locationPort}`;
  }

  dynamicFontsURL += "/static/fonts/dynamicFonts/fonts.json";

  return dynamicFontsURL;
}

export function getDefaultToolbarItems() {
  // This adds our built-in layout-config button to the toolbar of every example.
  // https://www.nutrient.io/guides/web/customizing-the-interface/document-presentation-options/#layout-configurator
  let toolbarItems = [...PSPDFKit.defaultToolbarItems];
  const pagerIndex = PSPDFKit.defaultToolbarItems.findIndex(function (item) {
    return item.type === "pager";
  });

  toolbarItems.splice(pagerIndex + 1, 0, { type: "layout-config" });

  return toolbarItems;
}

export function unload(container, unloadHook) {
  if (typeof unloadHook === "function") {
    unloadHook(container);
  } else {
    // We allow our examples to skip exporting an `unload` hook. When this is
    // the case, we fall back to the default unloading behavior for a container.
    PSPDFKit.unload(container);
  }
}

export function getLicenseKey() {
  return document
    .querySelector('meta[name="web-sdk-license-key"]')
    .getAttribute("content");
}

// We store the sharable ID in the location's query part to make it possible
// to copy and paste the URL into another browser window to show of Instant.
export function ensureProperSearchParams(serverDocument) {
  let currentUrl = new URL(location.href);

  const currentId = currentUrl.searchParams.get(ID);
  const nextId = serverDocument ? serverDocument.id : null;

  if (currentId !== nextId) {
    if (nextId) {
      currentUrl.searchParams.set(ID, nextId);
    } else {
      currentUrl.searchParams.delete(ID);
    }

    Router.replace(currentUrl.pathname + currentUrl.search);
  }
}

export function ensureTrailingSlash(url) {
  // Ensure a trailing slash
  var lastChar = url.substr(-1);

  if (lastChar !== "/") {
    url = url + "/";
  }

  return url;
}

// We dynamically assemble the correct Server URL. We inject the necessary
// information via a <meta> tag.
function getServerUrl() {
  const DOCUMENT_ENGINE_URL_OR_PORT = document
    .querySelector('meta[name="document-engine-url-or-port"]')
    .getAttribute("content");

  let serverUrl =
    DOCUMENT_ENGINE_URL_OR_PORT.indexOf("/") > 0
      ? DOCUMENT_ENGINE_URL_OR_PORT
      : `${window.location.protocol}//${location.hostname}:${DOCUMENT_ENGINE_URL_OR_PORT}`;

  return ensureTrailingSlash(serverUrl);
}

function getAIAUrl() {
  return document
    .querySelector('meta[name="nutrient-aia-url"]')
    .getAttribute("content");
}

export const toolbarCustomBreakpoint = 1200;
