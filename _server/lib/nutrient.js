const { blob } = require("node:stream/consumers");

const { DOCUMENT_ENGINE_INTERNAL_URL } = process.env;
DOCUMENT_ENGINE_API_AUTH_TOKEN =
  process.env.DOCUMENT_ENGINE_API_AUTH_TOKEN || "secret";

if (!DOCUMENT_ENGINE_INTERNAL_URL) {
  throw new Error(
    "You have to set the DOCUMENT_ENGINE_INTERNAL_URL environment variable."
  );
}

if (!DOCUMENT_ENGINE_API_AUTH_TOKEN) {
  throw new Error(
    "You have to set the DOCUMENT_ENGINE_API_AUTH_TOKEN environment variable."
  );
}

/**
 * In this file, we're implementing the necessary Document Engine API.
 *
 * @see https://www.nutrient.io/api/reference/document-engine/upstream/#tag/Documents
 */
const NutrientViewer = {
  documents: {
    /**
     * POST /api/documents
     *
     * Uploads a document. This will generate a new documentId when none is
     * passed. The documentId is the identifier on Nutrient Document Engine. We can pass
     * an arbitrary documentId.
     *
     * Document Engine will extract the title of the document from the PDF
     * metadata if it is present. To achieve this, we're issuing a multi part
     * upload using the [form-data][] package.
     *
     * [form-data]: https://www.npmjs.com/package/form-data
     */
    async upload(readStream, filename, documentId = null) {
      let form = new FormData();

      form.append("file", await blob(readStream), filename);
      form.append("filename", filename);

      if (documentId) {
        form.append("document_id", documentId);
      }

      const response = await fetch(
        `${DOCUMENT_ENGINE_INTERNAL_URL}/api/documents`,
        {
          method: "POST",
          headers: {
            Authorization: `Token token=${DOCUMENT_ENGINE_API_AUTH_TOKEN}`,
          },
          body: form,
        }
      ).then((res) => {
        if (!res.ok) {
          return res.text();
        }

        return res.json();
      });

      return unwrapError(response);
    },

    /**
     * GET /api/documents/:documentId/properties
     *
     * Request properties of a given documentId. This will error when the
     * document id is no longer valid (in case of a server reset or when the
     * document was manually deleted).
     */
    async properties(documentId) {
      const response = await fetch(
        `${DOCUMENT_ENGINE_INTERNAL_URL}/api/documents/${documentId}/properties`,
        {
          method: "GET",
          headers: {
            Authorization: `Token token=${DOCUMENT_ENGINE_API_AUTH_TOKEN}`,
          },
        }
      ).then((res) => res.json());

      return unwrapError(response);
    },
  },
  signatures: {
    async signHash(signRequest) {
      const response = await fetch(
        `${DOCUMENT_ENGINE_INTERNAL_URL}/api/sign_hash`,
        {
          method: "POST",
          headers: {
            Authorization: `Token token=${DOCUMENT_ENGINE_API_AUTH_TOKEN}`,
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
        }
      ).then((res) => res.json());

      return unwrapError(response);
    },
    async getCertificates(request) {
      const response = await fetch(
        `${DOCUMENT_ENGINE_INTERNAL_URL}/api/get_certificates`,
        {
          method: "POST",
          headers: {
            Authorization: `Token token=${DOCUMENT_ENGINE_API_AUTH_TOKEN}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signingToken: request.signingToken,
          }),
        }
      ).then((res) => res.json());

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

Please contact support@nutrient.io`);
  }
}

module.exports = NutrientViewer;
