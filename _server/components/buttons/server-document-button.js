import FileInputButton from "./file-input-button";

export default function ServerDocumentButton({ uploadCustomPdf }) {
  return (
    <FileInputButton
      onChange={uploadCustomPdf}
      accept={[
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/msword", // doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
        "application/vnd.openxmlformats-officedocument.wordprocessingml.template", // doct
        "application/vnd.ms-excel", // xls", "xlt", "xla
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
        "application/vnd.openxmlformats-officedocument.spreadsheetml.template", // xltx
        "application/vnd.ms-powerpoint", // ppt", "pps", "pot", "ppa
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
        "application/vnd.openxmlformats-officedocument.presentationml.template", // potx
        "application/vnd.openxmlformats-officedocument.presentationml.slideshow", // ppsx
      ]}
    >
      Upload Document
    </FileInputButton>
  );
}
