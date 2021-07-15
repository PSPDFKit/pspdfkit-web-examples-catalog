import ServerDocumentButton from "../components/buttons/server-document-button";

export default function UploadPage({ uploadCustomPdf, isUploading }) {
  return (
    <React.Fragment>
      <div className="custom-pdf-page">
        {isUploading ? (
          <div className="message">
            <p>Uploading the PDF ...</p>
          </div>
        ) : (
          <div className="message">
            <p>Please upload a PDF to try out PSPDFKit for Web Server</p>
            <ServerDocumentButton uploadCustomPdf={uploadCustomPdf} />
          </div>
        )}
      </div>
      <style jsx>
        {`
          .custom-pdf-page {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f6f8fa;
          }
          .message {
            width: 100%;
            max-width: 400px;
            background: #fff;
            padding: 25px;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
          }
        `}
      </style>
    </React.Fragment>
  );
}
