import PSPDFKit from "@nutrient-sdk/viewer";

import { getReadableSignatureInfo } from "./utils";

export function createSignaturesInfoNode(instance, signaturesInfoSidebar) {
  const signaturesInfoContainer = document.createElement("div");
  signaturesInfoContainer.classList.add("signaturesInfo");
  signaturesInfoContainer.innerHTML = signaturesInfoSidebar;

  function updateSignaturesInfo() {
    setTimeout(async () => {
      const signaturesInfo = await instance.getSignaturesInfo();
      const signaturesInfoBody = signaturesInfoContainer.querySelector(
        ".signaturesInfo__body"
      );
      const header = signaturesInfoContainer.querySelector(
        ".signaturesInfo__common"
      );
      header.innerHTML = "";
      Object.entries(signaturesInfo).forEach(([key, value]) => {
        if (typeof value !== "undefined" && key !== "signatures") {
          const div = document.createElement("div");
          addEntry(div, key, value);
          header.append(div);
        }
      });

      const signatureInfoList = signaturesInfoContainer.querySelector(
        ".signaturesInfo__list"
      );
      signatureInfoList.innerHTML = "";
      signaturesInfo.signatures.forEach((signature, index) => {
        const signatureInfo = document.createElement("details");
        const signatureInfoHeader = document.createElement("summary");

        if (
          signature.signatureValidationStatus ===
          PSPDFKit.SignatureValidationStatus.valid
        ) {
          signatureInfoHeader.classList.add("signaturesInfo__summary--valid");
        } else if (
          signature.signatureValidationStatus ===
          PSPDFKit.SignatureValidationStatus.warning
        ) {
          signatureInfoHeader.classList.add("signaturesInfo__summary--warning");
        } else if (
          signature.signatureValidationStatus ===
          PSPDFKit.SignatureValidationStatus.error
        ) {
          signatureInfoHeader.classList.add("signaturesInfo__summary--error");
        }

        signatureInfoHeader.append(`Signature ${index + 1}`);
        signatureInfo.append(signatureInfoHeader);
        Object.entries(signature).forEach(([key, value]) => {
          if (typeof value !== "undefined" && key !== "type") {
            const listItem = document.createElement("dd");
            addEntry(listItem, key, value);
            signatureInfo.append(listItem);
          }
        });
        signatureInfoList.append(signatureInfo);
      });

      signaturesInfoBody.append(signatureInfoList);
      signaturesInfoContainer.append(signaturesInfoBody);
    }, 0);
  }

  instance.addEventListener("document.change", updateSignaturesInfo);
  instance.addEventListener("annotations.change", updateSignaturesInfo);
  instance.addEventListener("formFields.change", updateSignaturesInfo);
  instance.addEventListener("bookmarks.change", updateSignaturesInfo);
  updateSignaturesInfo();

  return signaturesInfoContainer;
}

function addEntry(container, key, value) {
  const { readableKey, readableValue } = getReadableSignatureInfo(key, value);
  const label = document.createElement("strong");
  label.append(readableKey);
  container.append(label);
  container.append(": ");
  container.append(readableValue);
}
