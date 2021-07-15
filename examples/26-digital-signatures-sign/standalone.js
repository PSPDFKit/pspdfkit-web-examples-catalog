import PSPDFKit from "pspdfkit";
import { attachListeners, initialToolbarItems } from "./index";

let forge = null;
let instance = null;

const buttons = {
  saveButton: null,
  finishButton: {
    type: "custom",
    title: "Finish Signing",
    className: "finish-signing",
    name: "sign",
    async onPress() {
      // When "Finish Signing" is pressed, after the user
      // has added an ink signature, we proceed to apply
      // a digital signature to the document. From this
      // point on the integrity of the file is guaranteed.
      try {
        await instance.signDocument(null, generatePKCS7);
        console.log("New signature added to the document!");
      } catch (error) {
        console.error(error);
      }
    },
  },
  resetButton: {
    type: "custom",
    title: "Reset",
    name: "reset",
    async onPress() {
      location.href = "/digital-signatures-sign";
    },
  },
};

export default function load(defaultConfiguration) {
  const { toolbarItems } = defaultConfiguration;

  import("./static/forge.min.js").then(({ default: _forge }) => {
    forge = _forge;
  });

  // split the rest of the toolbar items from the save button so that
  // later we can keep it as the last item while adding the sign button
  buttons.saveButton = toolbarItems[toolbarItems.length - 1];

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: initialToolbarItems,
    styleSheets: ["/digital-signatures-sign/static/styles.css"],
    initialViewState: new PSPDFKit.ViewState({
      showSignatureValidationStatus:
        PSPDFKit.ShowSignatureValidationStatusMode.IF_SIGNED,
    }),
    async trustedCAsCallback() {
      // The particular certificate + private key that we are going to use
      // for signing this example were issued by this CA that we are going
      // to use for validation after signing.
      const response = await fetch("/digital-signatures-sign/static/ca.pem");
      const cert = await response.text();

      return [cert];
    },
  }).then(async (_instance) => {
    instance = _instance;
    console.log("PSPDFKit for Web successfully loaded!!", instance);
    attachListeners(instance, buttons);

    return instance;
  });
}

// Naive implementation that fetches the private key over the network.
// Do not use it for a production deployment.
async function generatePKCS7({ fileContents }) {
  const certificatePromise = fetch(
    "/digital-signatures-sign/static/certificate.pem"
  ).then((response) => response.text());
  const privateKeyPromise = fetch(
    "/digital-signatures-sign/static/private-key.pem"
  ).then((response) => response.text());
  const [certificatePem, privateKeyPem] = await Promise.all([
    certificatePromise,
    privateKeyPromise,
  ]);
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
}

// https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function stringToArrayBuffer(binaryString) {
  const buffer = new ArrayBuffer(binaryString.length);
  let bufferView = new Uint8Array(buffer);

  for (let i = 0, len = binaryString.length; i < len; i++) {
    bufferView[i] = binaryString.charCodeAt(i);
  }

  return buffer;
}
