import FileInputButton from "./file-input-button";

export default function StandaloneDocumentButton({ showCustomPdf }) {
  return (
    <FileInputButton
      onChange={(file) => {
        showCustomPdf(file, "standalone");
      }}
    >
      Open Document
    </FileInputButton>
  );
}
