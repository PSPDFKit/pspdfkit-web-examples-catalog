import { readableSignatureInfoMap } from "./readableSignatureInfoMap.js";

export function dialog(instance, text) {
  const p = document.createElement("p");
  p.textContent = text;
  const button = document.createElement("button");
  button.textContent = "OK";
  button.addEventListener("click", () => {
    instance.removeCustomOverlayItem("dialog");
  });
  const dialogContent = document.createElement("div");
  dialogContent.appendChild(p);
  dialogContent.appendChild(button);
  dialogContent.classList.add("dialog");
  const { width, height } = instance.pageInfoForIndex(0);
  dialogContent.style.width = `${width / 2}px`;
  instance.setCustomOverlayItem(
    new PSPDFKit.CustomOverlayItem({
      id: "dialog",
      node: dialogContent,
      pageIndex: 0,
      position: new PSPDFKit.Geometry.Point({ x: width / 2, y: height / 4 }),
    })
  );
}

export function getReadableSignatureInfo(key, value) {
  return {
    readableKey: readableSignatureInfoMap[key] || key,
    readableValue: readableSignatureInfoMap[value] || value,
  };
}

export function convertPemToBinary(pem) {
  const lines = pem.split("\n");
  let encoded = "";

  for (let i = 0; i < lines.length; i++) {
    if (
      lines[i].trim().length > 0 &&
      lines[i].indexOf("-BEGIN RSA PRIVATE KEY-") < 0 &&
      lines[i].indexOf("-BEGIN PRIVATE KEY-") < 0 &&
      lines[i].indexOf("-BEGIN RSA PUBLIC KEY-") < 0 &&
      lines[i].indexOf("-BEGIN CERTIFICATE-") < 0 &&
      lines[i].indexOf("-END RSA PRIVATE KEY-") < 0 &&
      lines[i].indexOf("-END PRIVATE KEY-") < 0 &&
      lines[i].indexOf("-END RSA PUBLIC KEY-") < 0 &&
      lines[i].indexOf("-END CERTIFICATE-") < 0
    ) {
      encoded += lines[i].trim();
    }
  }

  return base64StringToArrayBuffer(encoded);
}

function base64StringToArrayBuffer(b64str) {
  const byteStr = atob(b64str);
  const bytes = new Uint8Array(byteStr.length);

  for (let i = 0; i < byteStr.length; i++) {
    bytes[i] = byteStr.charCodeAt(i);
  }

  return bytes.buffer;
}
