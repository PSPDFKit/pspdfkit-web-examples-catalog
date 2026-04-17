import PSPDFKit from "@nutrient-sdk/viewer";

export function load(defaultConfiguration) {
  const configuration = {
    ...defaultConfiguration,
    theme: PSPDFKit.Theme.DARK,
  };

  return PSPDFKit.load(configuration).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded in dark mode.", instance);

    return instance;
  });
}
