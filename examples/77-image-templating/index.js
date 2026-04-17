import PSPDFKit from "@nutrient-sdk/viewer";

async function fetchAsDataUrl(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch image asset at ${url}: ${response.status} ${response.statusText}`,
    );
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error(`Failed to convert ${url} to a data URL.`));

    reader.readAsDataURL(blob);
  });
}

function extractBase64Payload(dataUrl) {
  const match = /^data:[^;]+;base64,(.+)$/i.exec(dataUrl);

  if (!match) {
    throw new Error("Expected a base64 data URL.");
  }

  return match[1];
}

export async function load(defaultConfiguration) {
  const getExampleAssetPath = (assetName) =>
    `${window.location.pathname.replace(/\/$/, "")}/${assetName}`;
  const getExampleAssetAbsoluteUrl = (assetName) =>
    `${window.location.origin}${getExampleAssetPath(assetName)}`;

  if (defaultConfiguration.authPayload) {
    // This example demonstrates standalone image templating. In server mode
    // we render a static PDF fallback instead.
    console.warn(
      "Image templating catalog example runs only in standalone mode. Showing static fallback in server mode.",
    );

    return PSPDFKit.load({
      ...defaultConfiguration,
      document: getExampleAssetPath("example.pdf"),
    });
  }

  const primarySignatureUrl = getExampleAssetAbsoluteUrl("logo.png");
  const counterSignatureUrl = getExampleAssetAbsoluteUrl("cosigner.png");
  const counterSignatureDataUrl = await fetchAsDataUrl(counterSignatureUrl);
  const counterSignatureBase64 = extractBase64Payload(counterSignatureDataUrl);

  const templateData = {
    config: {
      delimiter: {
        start: "{{",
        end: "}}",
      },
    },
    model: {
      contractNumber: "MSA-2026-001",
      effectiveDate: "2026-03-01",
      providerName: "DukSoftware",
      clientName: "Acme Industries",
      signerName: "John Doe",
      signerTitle: "VP Legal",
      signatureUrl: {
        _type: "image",
        source: "url",
        url: primarySignatureUrl,
        sizing: "fit-width",
        width: 220,
      },
      signatureDataUrl: {
        _type: "image",
        source: "dataUrl",
        data: counterSignatureDataUrl,
        sizing: "fit-width",
        width: 220,
      },
      signatureBase64: {
        _type: "image",
        source: "base64",
        data: counterSignatureBase64,
        format: "png",
        sizing: "fit-width",
        width: 220,
      },
    },
  };

  const populatedDocx = await PSPDFKit.populateDocumentTemplate(
    {
      ...defaultConfiguration,
      document: getExampleAssetPath("template.docx"),
    },
    templateData,
  );

  const populatedPdf = await PSPDFKit.convertToPDF({
    ...defaultConfiguration,
    document: populatedDocx,
  });

  return PSPDFKit.load({
    ...defaultConfiguration,
    document: populatedPdf,
  });
}
