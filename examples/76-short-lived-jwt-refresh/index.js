import PSPDFKit from "@nutrient-sdk/viewer";

const TOKEN_TTL_SECONDS = 30;

function isServerMode(defaultConfiguration) {
  return (
    typeof defaultConfiguration.serverUrl === "string" &&
    typeof defaultConfiguration.documentId === "string" &&
    Boolean(defaultConfiguration.authPayload?.jwt)
  );
}

async function fetchShortLivedJwt(jwt) {
  const response = await fetch("/api/instant-short-lived", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ jwt }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const { jwt: nextJwt } = await response.json();

  return nextJwt;
}

export async function load(defaultConfiguration) {
  if (!isServerMode(defaultConfiguration)) {
    return PSPDFKit.load(defaultConfiguration);
  }

  let jwt = defaultConfiguration.authPayload.jwt;
  jwt = await fetchShortLivedJwt(jwt);
  let instance = null;

  instance = await PSPDFKit.load({
    ...defaultConfiguration,
    authPayload: {
      ...defaultConfiguration.authPayload,
      jwt,
    },
    onAuthFailed: async () => {
      jwt = await fetchShortLivedJwt(jwt);

      console.log(
        `Auth failed, refreshing with a new ${TOKEN_TTL_SECONDS}s JWT token.`,
      );
      instance.setSession(jwt);
    },
  });

  console.log(`Loaded with ${TOKEN_TTL_SECONDS}s JWT token lifetime in server mode.`);

  return instance;
}
