import FileInputButton from "./file-input-button";

export default function ServerDocumentButton({ uploadCustomPdf }) {
  return (
    <FileInputButton
      onChange={event => {
        if (event.target.files.length == 0) {
          event.target.value = null;
          return;
        }
        var pdfFile = event.target.files[0];

        uploadCustomPdf(pdfFile);
        event.target.value = null;
      }}
    >
      Upload Document
    </FileInputButton>
  );
}
