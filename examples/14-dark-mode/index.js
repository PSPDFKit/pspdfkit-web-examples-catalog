import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  const configuration = {
    ...defaultConfiguration,
    theme: PSPDFKit.Theme.DARK
  };

  return PSPDFKit.load(configuration).then(instance => {
    console.log("PSPDFKit for Web successfully loaded in dark mode.", instance);
    return instance;
  });
}
