/**
 * In this module, we are exposing functions to generate unique layer names. In
 * order to achieve uniqueness, we're making the layer name rather long (128 bit
 * to be precise).
 *
 * Together with this, we also expose two functions to generate and parse a
 * shareable id that contains not only the layer name but also the document id
 * and a hash of the example id as additional information.
 *
 * This is required in the catalog example since we want to be able to share
 * those ids across different devices (to demonstrate PSPDFKit Instant) and
 * still be able to recover if the document is no longer valid. Additionally, we
 * are making our catalog public on https://pspdfkit.com and thus can't rely on
 * any per-user scoping.
 *
 * In your own application, you usually do not want this and you should consider
 * other ways to generate layer names, like the user id of your customers, for
 * example.
 *
 * @see https://pspdfkit.com/guides/server/current/api/instant-layers/
 */

const randomBytes = require("random-bytes");
const crypto = require("crypto");

const LAYER_NAME_ENTROPY = 128 / 8; // 128 bit
const DELIMITER = "."; // We use something that does not need to be URL encoded

/**
 * Generate a random layer name using 128 bit of entropy. The result will be a
 * base 64 encoded string.
 */
function createLayerName() {
  const bytes = randomBytes.sync(LAYER_NAME_ENTROPY);
  return bufferToUrlSafeBase64(bytes).replace("==", "");
}

/**
 * Returns a hash used to identify the example name. The hash consists of a
 * truncated SHA256 (first 24 bit) so it nicely fits into 4 base64 characters.
 */
function createExampleHash(exampleName) {
  const sha256Buffer = crypto
    .createHash("sha256")
    .update(exampleName)
    .digest();
  const truncatedBuffer = sha256Buffer.slice(0, 3);
  return bufferToUrlSafeBase64(truncatedBuffer);
}

/**
 * Given a documentId, an exampleName (might be null), and a layerName (base64
 * encoded string of 128 bit randomness), we calculate a unique identifier.
 *
 * The identifier will look like the following string:
 *
 *    01cgv5hzxph8xkd135c5rnxkdc:tdAY:hZbzNKoxxzFKdl27Hxv4TQ
 *                ^               ^              ^
 *          document id     example hash     layer name
 *
 * In case of a custom document, the example hash will be omitted:
 *
 *    01cgv5hzxph8xkd135c5rnxkdc:hZbzNKoxxzFKdl27Hxv4TQ
 *                  ^                   ^
 *            document id           layer name
 */
function encodeShareableId(documentId, layerName, exampleName = null) {
  const exampleIdHash = exampleName && createExampleHash(exampleName);
  return (
    documentId +
    DELIMITER +
    layerName +
    (exampleIdHash ? DELIMITER + exampleIdHash : "")
  );
}

/**
 * The inverse operation to encodeShareableId above. The results will be a
 * tuple of the following form:
 *
 *     [documentId, layerName, exampleHash]
 */
function decodeShareableId(id) {
  const segments = id.split(DELIMITER);

  let documentId;
  let layerName;
  let exampleHash = null;

  /* eslint-disable no-fallthrough */
  switch (segments.length) {
    case 3:
      // We extract the hash and fall-through to handle the rest
      [, , exampleHash] = segments;
    case 2:
      [documentId, layerName] = segments;
      break;
    default:
      throw new Error(
        `Sharable id error, got ${
          segments.length
        } segments. Please contact support@pspdfkit.com`
      );
  }

  if (!documentId && !layerName) {
    throw new Error(
      "Sharable id format error. Please contact support@pspdfkit.com"
    );
  }
  return [documentId, layerName, exampleHash];
}

// Since we're using the base64 encoded values in the URL, we want to make it
// URL safe by default.
//
// @see https://en.wikipedia.org/wiki/Base64#URL_applications
function bufferToUrlSafeBase64(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

module.exports = {
  createLayerName,
  createExampleHash,
  encodeShareableId,
  decodeShareableId
};
