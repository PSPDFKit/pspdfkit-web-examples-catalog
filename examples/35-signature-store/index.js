import PSPDFKit from "@nutrient-sdk/viewer";

const STORAGE_KEY = "signatures_storage";
const ATTACHMENTS_KEY = "attachments_storage";

export function load(defaultConfiguration) {
  return PSPDFKit.load(defaultConfiguration).then(async (instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    async function initializeSignatures() {
      const signaturesString = localStorage.getItem(STORAGE_KEY);

      if (signaturesString) {
        const storedSignatures = JSON.parse(signaturesString);
        // Construct annotations from serialized entries and call setStoredSignatures API
        const list = PSPDFKit.Immutable.List(
          storedSignatures.map(PSPDFKit.Annotations.fromSerializableObject)
        );

        instance.setStoredSignatures(list);

        const attachmentsString = localStorage.getItem(ATTACHMENTS_KEY);

        if (attachmentsString) {
          const attachmentsArray = JSON.parse(attachmentsString);
          // from the data URLs on local storage instantiate Blob objects
          const blobs = await Promise.all(
            attachmentsArray.map(({ url }) =>
              fetch(url).then((res) => res.blob())
            )
          );

          // create an attachment for each blob
          blobs.forEach((blob) => instance.createAttachment(blob));
        }
      }
    }

    initializeSignatures();

    instance.addEventListener("storedSignatures.create", async (annotation) => {
      let offeredSignature = annotation;

      try {
        const signaturesString = localStorage.getItem(STORAGE_KEY);
        const storedSignatures = signaturesString
          ? JSON.parse(signaturesString)
          : [];

        const serializedAnnotation =
          PSPDFKit.Annotations.toSerializableObject(annotation);

        if (annotation.imageAttachmentId) {
          const attachment = await instance.getAttachment(
            annotation.imageAttachmentId
          );

          // Create data URL and add it to local storage.
          // Note: This is done only for demonstration purpose.
          // Storing potential large chunks of data using local storage is
          // considered bad practice due to the synchronous nature of that API.
          // For production applications, please consider alternatives such a
          // dedicated back-end storage or IndexedDB.
          const url = await fileToDataURL(attachment);
          const attachmentsString = localStorage.getItem(ATTACHMENTS_KEY);
          const attachmentsArray = attachmentsString
            ? JSON.parse(attachmentsString)
            : [];

          attachmentsArray.push({ url, id: annotation.imageAttachmentId });
          localStorage.setItem(
            ATTACHMENTS_KEY,
            JSON.stringify(attachmentsArray)
          );
        }

        storedSignatures.push(serializedAnnotation);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSignatures));
        // Offer the stored copy, so deleting it matches what's in storage
        // (serializing fills in defaults such as backgroundColor)
        offeredSignature =
          PSPDFKit.Annotations.fromSerializableObject(serializedAnnotation);
      } catch (error) {
        // localStorage can be full (large image signatures fill it fast) or
        // hold data this example can't read; keep it for this session
        console.warn("Signature not stored in localStorage:", error);
      }

      // Add new annotation so that its render as part of the UI on the current session
      instance.setStoredSignatures((signatures) =>
        signatures.push(offeredSignature)
      );
    });

    instance.addEventListener("storedSignatures.delete", (annotation) => {
      try {
        const signaturesString = localStorage.getItem(STORAGE_KEY);
        const storedSignatures = signaturesString
          ? JSON.parse(signaturesString)
          : [];
        const annotations = storedSignatures.map(
          PSPDFKit.Annotations.fromSerializableObject
        );
        const updatedAnnotations = annotations.filter(
          (currentAnnotation) => !currentAnnotation.equals(annotation)
        );

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            updatedAnnotations.map(PSPDFKit.Annotations.toSerializableObject)
          )
        );

        // Remove attachment if it's an image signature no other stored
        // signature uses (the same image or typed name gives the same id)
        if (
          annotation instanceof PSPDFKit.Annotations.ImageAnnotation &&
          annotation.imageAttachmentId &&
          !updatedAnnotations.some(
            (remaining) =>
              remaining instanceof PSPDFKit.Annotations.ImageAnnotation &&
              remaining.imageAttachmentId === annotation.imageAttachmentId
          )
        ) {
          const attachmentsString = localStorage.getItem(ATTACHMENTS_KEY);

          if (attachmentsString) {
            let attachmentsArray = JSON.parse(attachmentsString);

            attachmentsArray = attachmentsArray.filter(
              (attachment) => attachment.id !== annotation.imageAttachmentId
            );
            localStorage.setItem(
              ATTACHMENTS_KEY,
              JSON.stringify(attachmentsArray)
            );
          }
        }
      } catch (error) {
        console.warn("Signature not removed from localStorage:", error);
      }

      // Use setStoredSignatures API so that the current UI is properly updated
      instance.setStoredSignatures((signatures) =>
        signatures.filter((signature) => !signature.equals(annotation))
      );
    });

    instance.addEventListener("document.change", initializeSignatures);

    return instance;
  });
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function () {
      resolve(reader.result);
    };
    reader.onerror = function () {
      reject(reader.error);
    };
    reader.readAsDataURL(file);
  });
}
