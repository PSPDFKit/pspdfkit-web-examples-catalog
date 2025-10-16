import PSPDFKit from "@nutrient-sdk/viewer";

export function load(defaultConfiguration) {
  return PSPDFKit.load(defaultConfiguration).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
}
