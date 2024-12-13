import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    allowLinearizedLoading: true,
    document:
      "https://public-solutions-engineering-bucket.s3.eu-central-1.amazonaws.com/docs/Linearized-iOS-QuickStart-Guides.pdf",
  }).then((instance) => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    return instance;
  });
}
