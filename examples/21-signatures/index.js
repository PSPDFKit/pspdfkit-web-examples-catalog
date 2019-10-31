import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    // This function gets invoked when the document is loaded and expects a list
    // of ink annotations as return value.
    populateInkSignatures() {
      // We retrieve our previously stored ink annotations from localStorage
      // and return them as a PSPDFKit.Immutable.List.
      // This will populate the signature selection for our users.
      const signatureJSON = localStorage.getItem("inkSignatures");
      const signatures = signatureJSON ? JSON.parse(signatureJSON) : [];

      return PSPDFKit.Immutable.List(
        signatures.map(PSPDFKit.Annotations.fromSerializableObject)
      );
    }
  }).then(instance => {
    // Whenever an ink signature is added, updated or deleted, we update the
    // signatures stored in localStorage.
    instance.addEventListener("inkSignatures.change", async () => {
      const signatures = await instance.getInkSignatures();
      const signaturesJSON = JSON.stringify(
        signatures
          .map(signature =>
            PSPDFKit.Annotations.toSerializableObject(signature)
          )
          .toJS()
      );
      localStorage.setItem("inkSignatures", signaturesJSON);
    });

    return instance;
  });
}
