const { PSPDFKIT_API_KEY, PSPDFKIT_API_URL } = process.env;

/**
 * In this file, we're implementing the necessary PSPDFKit API endpoints.
 */
const DocumentWebServicesAPI = {
  signatures: {
    async signHash(signRequest) {
      ensureEnvVariables();

      const response = await fetch(`${PSPDFKIT_API_URL}/i/sign_hash`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PSPDFKIT_API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataToBeSigned: signRequest.dataToBeSigned,
          hash: signRequest.hash,
          hashAlgorithm: signRequest.hashAlgorithm || "sha256",
          signatureType: signRequest.signatureType || "cades",
          signingToken: signRequest.signingToken,
          cadesLevel: signRequest.cadesLevel || "b-t",
        }),
      }).then((res) => res.json());

      return unwrapError(response);
    },
    async getCertificates() {
      ensureEnvVariables();

      const response = await fetch(`${PSPDFKIT_API_URL}/i/certificates`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PSPDFKIT_API_KEY}`,
          Accept: "application/json",
        },
      }).then((res) => res.json());

      return unwrapError(response);
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

Please contact support@pspdfkit.com`);
  }
}

function ensureEnvVariables() {
  if (!PSPDFKIT_API_KEY) {
    throw new Error(
      "You have to set the PSPDFKIT_API_KEY environment variable."
    );
  }

  if (!PSPDFKIT_API_URL) {
    throw new Error(
      "You have to set the PSPDFKIT_API_URL environment variable."
    );
  }
}

module.exports = DocumentWebServicesAPI;
