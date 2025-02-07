import PSPDFKit from "@nutrient-sdk/viewer";
import { convertPemToBinary, stringToArrayBuffer } from "./utils.js";

let forge = null;

export async function sign(instance, isPrivateKeyProvided, payload) {
  if (isPrivateKeyProvided) {
    return instance.signDocument(payload);
  }

  forge = (await import("./forge.min.js")).default;

  return instance.signDocument(
    payload,
    getGeneratePKCS7(payload.signingData.signatureType)
  );
}

function getGeneratePKCS7(signatureType) {
  const useSignatureType = signatureType;

  // Naive implementation that fetches the private key over the network.
  // Do not use it for a production deployment.
  return async function generatePKCS7({ fileContents, dataToBeSigned }) {
    const certificatePromise = fetch(
      "/digital-signatures-visible-sign/static/certificate.pem"
    ).then((response) => response.text());
    const privateKeyPromise = fetch(
      "/digital-signatures-visible-sign/static/private-key.pem"
    ).then((response) => response.text());
    const [certificatePem, privateKeyPem] = await Promise.all([
      certificatePromise,
      privateKeyPromise,
    ]);

    if (useSignatureType === PSPDFKit.SignatureType.CAdES) {
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

    const certificate = forge.pki.certificateFromPem(certificatePem);
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    const p7 = forge.pkcs7.createSignedData();

    p7.content = new forge.util.ByteBuffer(fileContents);
    p7.addCertificate(certificate);
    p7.addSigner({
      key: privateKey,
      certificate: certificate,
      digestAlgorithm: forge.pki.oids.sha256,
      authenticatedAttributes: [
        {
          type: forge.pki.oids.contentType,
          value: forge.pki.oids.data,
        },
        {
          type: forge.pki.oids.messageDigest,
        },
        {
          type: forge.pki.oids.signingTime,
          value: new Date(),
        },
      ],
    });

    p7.sign({ detached: true });

    return stringToArrayBuffer(forge.asn1.toDer(p7.toAsn1()).getBytes());
  };
}
