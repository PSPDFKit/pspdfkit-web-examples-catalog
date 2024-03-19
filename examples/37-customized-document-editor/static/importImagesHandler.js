import PSPDFKit from "pspdfkit";

const imageTypes = ["image/png", "image/jpg", "image/jpeg", "image/tiff"];

export function importImagesHandler({
  instance,
  editorHandler,
  defaultConfiguration,
}) {
  const fileInput = document.createElement("input");
  fileInput.setAttribute("type", "file");
  fileInput.setAttribute("aria-label", "Select image");
  fileInput.setAttribute("aria-hidden", "true");
  fileInput.setAttribute("accept", imageTypes.join(","));
  fileInput.setAttribute("tabindex", "-1");
  fileInput.addEventListener("change", async function (event) {
    if (event.target.files.length > 0) {
      let files = [];

      for (const file of event.target.files) {
        files.push(file);
      }

      const imagePDFsToImport = await Promise.all(
        files.map(
          (file) =>
            // eslint-disable-next-line
            new Promise(async (resolve, reject) => {
              try {
                const url = URL.createObjectURL(file);
                const res = await fetch(url);
                const image = await res.arrayBuffer();
                const imageInstance = await PSPDFKit.load({
                  ...defaultConfiguration,
                  headless: true,
                  document: image,
                });
                const imageConvertedToPDF = await imageInstance.exportPDF();
                resolve(
                  new File([imageConvertedToPDF], file.name, {
                    type: file.type,
                    lastModified: file.lastModified,
                  })
                );
              } catch (error) {
                reject(error);
              }
            })
        )
      );

      const selectedIndexes = editorHandler.getSelectedPageIndexes();

      editorHandler.setOperations(
        (operations) =>
          operations.concat(
            imagePDFsToImport.map((file) => ({
              type: "importDocument",
              treatImportedDocumentAsOnePage: false,
              document: file,
              ...(selectedIndexes.size === 1
                ? { afterPageIndex: selectedIndexes.first() }
                : { beforePageIndex: 0 }),
            }))
          ),
        true
      );
    }
  });
  instance.contentDocument.body.append(fileInput);
  fileInput.removeAttribute("aria-hidden");
  fileInput.click();
}
