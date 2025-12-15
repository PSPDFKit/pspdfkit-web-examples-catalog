let Nutrient = null;

if (typeof window !== "undefined") {
  // Ensure window.PSPDFKit is available while the examples use it.
  if (!window.PSPDFKit && !window.NutrientViewer) {
    throw new Error(
      "Nutrient Web SDK was not successfully initialized. " +
        "We load the main entry point (nutrient-viewer.js) from Document Engine. " +
        "Please make sure that Document Engine is properly running."
    );
  }

  Nutrient = window.NutrientViewer;
}

export default Nutrient;
