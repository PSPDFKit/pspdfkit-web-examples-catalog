import PSPDFKit from "@nutrient-sdk/viewer";

import { convertPemToBinary } from "./utils.js";

let forge = null;

export async function sign(instance, payload, isStandalone) {
  forge = (await import("./forge.min.js")).default;

  return instance.signDocument(
    {
      ...payload,
      signingData: {
        signatureType: PSPDFKit.SignatureType.CAdES,
        certificates: [
          await fetch(
            "/electronic-digital-signatures/static/certificate.pem"
          ).then((response) => response.arrayBuffer()),
        ],
        ...(isStandalone
          ? null
          : { signatureContainer: PSPDFKit.SignatureContainerType.raw }),
      },
    },
    isStandalone
      ? generatePKCS7
      : {
          signingToken: "user-1-with-rights",
        }
  );
}

// Naive implementation that fetches the private key over the network.
// Do not use it for a production deployment.
async function generatePKCS7({ dataToBeSigned }) {
  const privateKeyPem = await fetch(
    "/electronic-digital-signatures/static/private-key.pem"
  ).then((response) => response.text());

  const signAlgorithm = {
    name: "RSASSA-PKCS1-v1_5",
    hash: {
      name: "SHA-256",
    },
    modulusLength: 2048,
    extractable: false,
    publicExponent: new Uint8Array([1, 0, 1]),
  };
  const importedPrivateKey = await window.crypto.subtle.importKey(
    "pkcs8",
    convertPemToBinary(privateKeyPem),
    signAlgorithm,
    true,
    ["sign"]
  );

  return window.crypto.subtle.sign(
    signAlgorithm,
    importedPrivateKey,
    dataToBeSigned
  );
}
