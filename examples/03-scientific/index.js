import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  return PSPDFKit.load(defaultConfiguration).then(instance => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);
    return instance;
  });
}
