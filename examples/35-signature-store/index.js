import PSPDFKit from "pspdfkit";

const STORAGE_KEY = "signatures_storage";
const ATTACHMENTS_KEY = "attachments_storage";

export function load(defaultConfiguration) {
  return PSPDFKit.load(defaultConfiguration).then(async (instance) => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);

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
        blobs.forEach(instance.createAttachment);
      }
    }

    instance.addEventListener("storedSignatures.create", async (annotation) => {
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
        localStorage.setItem(ATTACHMENTS_KEY, JSON.stringify(attachmentsArray));
      }

      storedSignatures.push(serializedAnnotation);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSignatures));
      // Add new annotation so that its render as part of the UI on the current session
      instance.setStoredSignatures((signatures) => signatures.push(annotation));
    });

    instance.addEventListener("storedSignatures.delete", (annotation) => {
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
      // Use setStoredSignatures API so that the current UI is properly updated
      instance.setStoredSignatures((signatures) =>
        signatures.filter((signature) => !signature.equals(annotation))
      );

      if (annotation.imageAttachmentId) {
        // Remove attachment from array
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
    });

    return instance;
  });
}

function fileToDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = function () {
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
