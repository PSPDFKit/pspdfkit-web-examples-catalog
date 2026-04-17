import PSPDFKit from "@nutrient-sdk/viewer";

let instance = null;
let documentAData = null;
let documentBData = null;
let currentConfiguration = null;

// Default document URLs (DOCX for testing Office conversion)
const DEFAULT_DOC_A = "text-comparison-file-upload/static/documentA.docx";
const DEFAULT_DOC_B = "text-comparison-file-upload/static/documentB.docx";

export function load(defaultConfiguration) {
  currentConfiguration = defaultConfiguration;

  // Load default documents first, then add upload UI after SDK loads
  return loadDefaultDocuments(defaultConfiguration);
}

function createUploadUI(container) {
  // Remove existing controls if any
  const existing = document.getElementById("upload-controls");
  if (existing) {
    existing.remove();
  }

  const containerEl = typeof container === "string"
    ? document.querySelector(container)
    : container;

  // Create wrapper for upload controls - append to parent to avoid container conflict
  const controls = document.createElement("div");
  controls.id = "upload-controls";
  controls.innerHTML = `
    <div style="
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
      background: rgba(37, 37, 37, 0.95);
      padding: 15px;
      border-radius: 8px;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    ">
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 6px; color: #ccc;">Document A:</label>
        <input type="file" id="doc-a-input" accept=".pdf,.docx,.xlsx,.pptx,.doc,.xls,.ppt,.jpg,.jpeg,.png,.tiff,.tif"
          style="font-size: 12px; color: #fff;">
        <div id="doc-a-name" style="margin-top: 4px; color: #888; font-size: 11px;">documentA.pdf</div>
      </div>
      <div>
        <label style="display: block; margin-bottom: 6px; color: #ccc;">Document B:</label>
        <input type="file" id="doc-b-input" accept=".pdf,.docx,.xlsx,.pptx,.doc,.xls,.ppt,.jpg,.jpeg,.png,.tiff,.tif"
          style="font-size: 12px; color: #fff;">
        <div id="doc-b-name" style="margin-top: 4px; color: #888; font-size: 11px;">documentB.pdf</div>
      </div>
      <div style="margin-top: 12px; font-size: 11px; color: #666;">
        Supports PDF, DOCX, XLSX, PPTX, images
      </div>
    </div>
  `;

  // Add to parent element, positioned relative to container
  containerEl.parentElement.style.position = "relative";
  containerEl.parentElement.appendChild(controls);

  // Attach event handlers
  document.getElementById("doc-a-input").addEventListener("change", handleDocAUpload);
  document.getElementById("doc-b-input").addEventListener("change", handleDocBUpload);
}

async function loadDefaultDocuments(configuration) {
  try {
    const [responseA, responseB] = await Promise.all([
      fetch("/" + DEFAULT_DOC_A),
      fetch("/" + DEFAULT_DOC_B),
    ]);

    const [bufferA, bufferB] = await Promise.all([
      responseA.arrayBuffer(),
      responseB.arrayBuffer(),
    ]);

    documentAData = {
      buffer: bufferA,
      mimeType: responseA.headers.get("content-type") || "application/pdf",
    };
    documentBData = {
      buffer: bufferB,
      mimeType: responseB.headers.get("content-type") || "application/pdf",
    };

    return loadTextComparison(configuration);
  } catch (error) {
    console.error("Failed to load default documents:", error);
    return null;
  }
}

async function loadTextComparison(configuration) {
  if (!documentAData || !documentBData) {
    console.log("Waiting for both documents...");
    return null;
  }

  // Clean up existing text comparison instance.
  // TextComparisonInstance has its own unload() that properly tears down
  // inner SDK instances, unmounts React, and removes the container.
  // PSPDFKit.unload() does NOT work for text comparison instances.
  if (instance) {
    try {
      instance.unload();
    } catch (e) {
      // Ignore unload errors
    }
    instance = null;
  }

  // Create blob URLs with proper MIME types
  const blobA = URL.createObjectURL(
    new Blob([documentAData.buffer], { type: documentAData.mimeType })
  );
  const blobB = URL.createObjectURL(
    new Blob([documentBData.buffer], { type: documentBData.mimeType })
  );

  try {
    instance = await PSPDFKit.loadTextComparison({
      ...configuration,
      documentA: blobA,
      documentB: blobB,
      wordLevel: false,
      toolbarItems: PSPDFKit.defaultTextComparisonToolbarItems,
    });

    console.log("Text Comparison loaded successfully!");
    console.log("Document A type:", documentAData.mimeType);
    console.log("Document B type:", documentBData.mimeType);

    // Add upload UI AFTER SDK loads successfully
    createUploadUI(configuration.container);

    return instance;
  } catch (error) {
    console.error("Failed to load Text Comparison:", error);
    throw error;
  } finally {
    // Clean up blob URLs after a delay (SDK needs time to read them)
    setTimeout(() => {
      URL.revokeObjectURL(blobA);
      URL.revokeObjectURL(blobB);
    }, 5000);
  }
}

function handleDocAUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  document.getElementById("doc-a-name").textContent = file.name;

  file.arrayBuffer().then((buffer) => {
    documentAData = {
      buffer,
      mimeType: file.type || "application/octet-stream",
    };

    console.log("Document A uploaded:", file.name, "type:", documentAData.mimeType);

    if (documentBData && currentConfiguration) {
      loadTextComparison(currentConfiguration);
    }
  });
}

function handleDocBUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  document.getElementById("doc-b-name").textContent = file.name;

  file.arrayBuffer().then((buffer) => {
    documentBData = {
      buffer,
      mimeType: file.type || "application/octet-stream",
    };

    console.log("Document B uploaded:", file.name, "type:", documentBData.mimeType);

    if (documentAData && currentConfiguration) {
      loadTextComparison(currentConfiguration);
    }
  });
}
