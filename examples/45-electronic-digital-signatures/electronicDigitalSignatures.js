import PSPDFKit from "@nutrient-sdk/viewer";

import { sign } from "./static/sign";

export async function convertElectronicToVisibleDigitalSignature(
  instance,
  annotation,
  isStandalone
) {
  if (annotation.isSignature) {
    await instance.ensureChangesSaved(annotation);

    let watermarkImage;

    if (annotation instanceof PSPDFKit.Annotations.ImageAnnotation) {
      watermarkImage = await instance.getAttachment(
        annotation.imageAttachmentId
      );
    } else if (annotation instanceof PSPDFKit.Annotations.InkAnnotation) {
      watermarkImage = await renderInkAnnotation(instance, annotation);
    }

    const formField = await getFormFieldForSignatureAnnotation(
      instance,
      annotation
    );

    instance.delete(annotation);

    let useFormField = true;

    if (formField) {
      const signaturesInfo = await instance.getSignaturesInfo();

      useFormField = signaturesInfo.signatures.every((signatureInfo) => {
        return signatureInfo.signatureFormFQN !== formField.name;
      });
    }

    await sign(
      instance,
      {
        ...(formField && useFormField
          ? { formFieldName: formField.name }
          : {
              position: {
                pageIndex: annotation.pageIndex,
                boundingBox: annotation.boundingBox,
              },
            }),
        appearance: {
          watermarkImage,
          mode: PSPDFKit.SignatureAppearanceMode.signatureAndDescription,
          showSigner: false,
          showReason: false,
          showLocation: false,
          showSignDate: false,
          showWatermark: true,
        },
      },
      isStandalone
    );
  }
}

async function getFormFieldForSignatureAnnotation(instance, annotation) {
  const formFields = await instance.getFormFields();
  const annotations = await instance.getAnnotations(annotation.pageIndex);

  return formFields.find((formField) => {
    if (formField instanceof PSPDFKit.FormFields.SignatureFormField) {
      const formFieldAnnotationIds = formField.annotationIds.toArray();

      const signatureWidget = annotations.find(
        (maybeSignatureWidget) =>
          formFieldAnnotationIds.includes(maybeSignatureWidget.id) ||
          formFieldAnnotationIds.includes(
            String(maybeSignatureWidget.pdfObjectId)
          )
      );

      if (
        signatureWidget &&
        signatureWidget.boundingBox.isRectOverlapping(annotation.boundingBox)
      ) {
        return true;
      }
    }

    return false;
  });
}

async function renderInkAnnotation(instance, annotation) {
  const {
    boundingBox: { left, top, width, height },
  } = annotation;
  const canvas = document.createElement("canvas");
  const resolutionFactor = window.devicePixelRatio * instance.currentZoomLevel;
  canvas.width = width * resolutionFactor;
  canvas.height = height * resolutionFactor;

  const context = canvas.getContext("2d");

  context.lineWidth = annotation.lineWidth * resolutionFactor;
  context.strokeStyle = annotation.strokeColor.toCSSValue();

  annotation.lines.forEach((line) => {
    context.beginPath();
    context.moveTo(
      (line.first().x - left) * resolutionFactor,
      (line.first().y - top) * resolutionFactor
    );

    line.forEach((point) => {
      context.lineTo(
        (point.x - left) * resolutionFactor,
        (point.y - top) * resolutionFactor
      );
    });

    context.stroke();
  });

  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}
