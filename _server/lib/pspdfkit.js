require("isomorphic-fetch");

const FormData = require("form-data");

const { PSPDFKIT_SERVER_INTERNAL_URL } = process.env;
const AUTH_TOKEN = "secret";

if (!PSPDFKIT_SERVER_INTERNAL_URL) {
  throw new Error(
    "You have to set the PSPDFKIT_SERVER_INTERNAL_URL environment variable."
  );
}

/**
 * In this file, we're implementing the necessary PSPDFKit Server to Server API.
 *
 * @see https://pspdfkit.com/guides/server/current/api/documents/
 */
const PSPDFKit = {
  documents: {
    /**
     * POST /api/documents
     *
     * Uploads a document. This will generate a new documentId when none is
     * passed. The documentId is the identifier on PSPDFKit Server. We can pass
     * an arbitrary documentId.
     *
     * PSPDFKit Server will extract the title of the document from the PDF
     * metadata if it is present. To achieve this, we're issuing a multi part
     * upload using the [form-data][] package.
     *
     * [form-data]: https://www.npmjs.com/package/form-data
     */
    async upload(readStream, filename, documentId = null) {
      let form = new FormData();
      form.append("file", readStream, filename);
      form.append("filename", filename);
      if (documentId) {
        form.append("document_id", documentId);
      }

      const response = await fetch(
        `${PSPDFKIT_SERVER_INTERNAL_URL}/api/documents`,
        {
          method: "POST",
          headers: {
            Authorization: `Token token=${AUTH_TOKEN}`
          },
          body: form
        }
      ).then(res => res.json());

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
        `${PSPDFKIT_SERVER_INTERNAL_URL}/api/documents/${documentId}/properties`,
        {
          method: "GET",
          headers: {
            Authorization: `Token token=${AUTH_TOKEN}`
          }
        }
      ).then(res => res.json());

      return unwrapError(response);
    }
  }
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

module.exports = PSPDFKit;
