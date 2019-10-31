import FileInputButton from "./file-input-button";

export default function StandaloneDocumentButton({ showCustomPdf }) {
  return (
    <FileInputButton
      onChange={event => {
        if (event.target.files.length == 0) {
          event.target.value = null;
          return;
        }
        var pdfFile = event.target.files[0];
        if (pdfFile.type !== "application/pdf") {
          throw new Error("Invalid file type, please load a PDF.");
        }

        showCustomPdf(pdfFile, "standalone");
        event.target.value = null;
      }}
    >
      Open Document
    </FileInputButton>
  );
}
