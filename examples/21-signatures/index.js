import PSPDFKit from "@nutrient-sdk/viewer";

let instance = null;

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
    },
    toolbarItems: defaultConfiguration.toolbarItems.reduce((acc, item) => {
      if (item.type === "export-pdf") {
        return acc.concat([
          {
            type: "custom",
            title: "Download",
            onPress: async () => {
              const pdf = await instance.exportPDF({
                flattenElectronicSignatures: true,
              });
              const blob = new Blob([pdf], { type: "application/pdf" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "document.pdf";
              a.click();
              URL.revokeObjectURL(url);
            },
          },
        ]);
      }

      return acc.concat([item]);
    }, []),
  }).then((_instance) => {
    instance = _instance;

    // Whenever an ink signature is added, updated or deleted, we update the
    // signatures stored in localStorage.
    instance.addEventListener("inkSignatures.change", async () => {
      const signatures = await instance.getInkSignatures();
      const signaturesJSON = JSON.stringify(
        signatures
          .map((signature) =>
            PSPDFKit.Annotations.toSerializableObject(signature)
          )
          .toJS()
      );

      localStorage.setItem("inkSignatures", signaturesJSON);
    });

    return instance;
  });
}
