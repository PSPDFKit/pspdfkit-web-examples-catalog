const { NUTRIENT_DWS_API_KEY } = process.env;

const NUTRIENT_DWS_API_URL =
  process.env.NUTRIENT_DWS_API_URL || "https://api.nutrient.io/";

/**
 * In this file, we're implementing the necessary Nutrient DWS API endpoints.
 */
const DocumentWebServicesAPI = {
  signatures: {
    async signHash(signRequest) {
      ensureEnvVariables();

      const response = await fetch(`${NUTRIENT_DWS_API_URL}/i/sign_hash`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NUTRIENT_DWS_API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataToBeSigned: signRequest.dataToBeSigned,
          hash: signRequest.hash,
          hashAlgorithm: signRequest.hashAlgorithm || "sha256",
          signatureType: signRequest.signatureType || "cades",
          signingToken: signRequest.signingToken,
          cadesLevel: signRequest.cadesLevel || "b-lt",
        }),
      }).then((res) => res.json());

      return unwrapError(response);
    },
    async getCertificates() {
      ensureEnvVariables();

      const response = await fetch(`${NUTRIENT_DWS_API_URL}/i/certificates`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${NUTRIENT_DWS_API_KEY}`,
          Accept: "application/json",
        },
      }).then((res) => res.json());

      return unwrapError(response);
    },
  },
  auth: {
    /**
     * Creates JWT token to use for DWS API client-side authentication.
     *
     * @param {} authTokenParameters - Parameters to use in the token. Supports `allowedOperations`, `allowedOrigins`, and `expirationTime`.
     * @returns The API token to use for client-side authentication.
     * @throws Error if the token creation fails.
     */
    async createToken(authTokenParameters = {}) {
      ensureEnvVariables();

      const response = await fetch(`${NUTRIENT_DWS_API_URL}/tokens`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NUTRIENT_DWS_API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authTokenParameters),
      });

      if (response.ok) {
        const json = await response.json();

        return json.accessToken;
      } else {
        throw new Error(
          `Failed to create auth token: ${JSON.stringify(
            await response.json()
          )}`
        );
      }
    },
  },
};

// We parse the response JSON and throw when an error was detected or unwrap the
// payload if not.
//
// A regular payload will always return data in the format of:
//
//    {
//      "data": {...}
//    }
//
// And an error will always look like:
//
//    {
//      "error": {
//        "reason": "some_reason"
//      }
//    }
function unwrapError(serverResponse) {
  if (serverResponse.error) {
    throw new Error(serverResponse.error.reason || "unknown_error_no_reason");
  } else if (serverResponse.data) {
    return serverResponse.data;
  } else {
    throw new Error(`Malformed server response detected:

${JSON.stringify(serverResponse, null, 2)}

Please contact support@nutrient.io`);
  }
}

function ensureEnvVariables() {
  if (!NUTRIENT_DWS_API_KEY) {
    throw new Error(
      "You have to set the NUTRIENT_DWS_API_KEY environment variable."
    );
  }
}

module.exports = DocumentWebServicesAPI;
