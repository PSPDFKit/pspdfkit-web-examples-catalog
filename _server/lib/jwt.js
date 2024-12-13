const jwt = require("jsonwebtoken");
const uuid = require("uuid");

const { JWT_PRIVATE_KEY } = process.env;

if (!JWT_PRIVATE_KEY) {
  throw new Error("You have to set the JWT_PRIVATE_KEY environment variable.");
}

const daysToSeconds = (days) => days * 24 * 60 * 60;

function createJwt(documentId, layerName, jwtParameters = {}) {
  return jwt.sign(
    {
      permissions: ["read-document", "write", "download"],
      document_id: documentId,
      layer: layerName,
      ...jwtParameters,
    },
    JWT_PRIVATE_KEY,
    {
      algorithm: "RS256",
      expiresIn: daysToSeconds(3),
      jwtid: uuid.v4(),
      allowInsecureKeySizes: true,
    }
  );
}

function createJwtForCover(documentId, layerName) {
  return jwt.sign(
    {
      permissions: ["cover-image"],
      document_id: documentId,
      layer: layerName,
    },
    JWT_PRIVATE_KEY,
    {
      algorithm: "RS256",
      expiresIn: daysToSeconds(3),
    }
  );
}

const createAIAssistantJwt = () => {
  return jwt.sign({}, JWT_PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: daysToSeconds(3),
    allowInsecureKeySizes: true,
  });
};

function createJwtForProcessing(jwtParameters = {}) {
  return jwt.sign(jwtParameters, JWT_PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: 60 * 60, // 1 hour
    jwtid: uuid.v4(),
    allowInsecureKeySizes: true,
  });
}

module.exports = {
  createJwt,
  createJwtForCover,
  createAIAssistantJwt: createAIAssistantJwt,
  createJwtForProcessing,
};
