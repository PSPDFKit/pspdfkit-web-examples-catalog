import PSPDFKit from "@nutrient-sdk/viewer";

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    allowLinearizedLoading: true,
    document:
      "https://public-solutions-engineering-bucket.s3.eu-central-1.amazonaws.com/docs/Linearized-iOS-QuickStart-Guides.pdf",
  }).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
}
