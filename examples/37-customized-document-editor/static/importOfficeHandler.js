import PSPDFKit from "pspdfkit";

const officeTypes = [
  "application/msword", // doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template", // doct
  "application/vnd.ms-word.document.macroEnabled.12", //.docm
  "application/vnd.ms-excel", // xls", "xlt", "xla
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template", // xltx
  "application/vnd.ms-powerpoint", // ppt", "pps", "pot", "ppa
  "application/vnd.ms-powerpoint.presentation.macroEnabled.12", // .pptm
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  "application/vnd.openxmlformats-officedocument.presentationml.template", // potx
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow", // ppsx
  "application/vnd.ms-excel.sheet.macroEnabled.12", // .xlsm
];

export function importOfficeHandler({
  instance,
  editorHandler,
  defaultConfiguration,
}) {
  const fileInput = document.createElement("input");
  fileInput.setAttribute("type", "file");
  fileInput.setAttribute("aria-label", "Select image");
  fileInput.setAttribute("aria-hidden", "true");
  fileInput.setAttribute("accept", officeTypes.join(","));
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
                const officeFile = await res.arrayBuffer();
                const officeConvertedToPDF = await PSPDFKit.convertToPDF({
                  ...defaultConfiguration,
                  document: officeFile,
                });
                resolve(
                  new File([officeConvertedToPDF], file.name, {
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
              treatImportedDocumentAsOnePage: true,
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
