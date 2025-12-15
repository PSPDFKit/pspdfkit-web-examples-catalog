import PSPDFKit from "@nutrient-sdk/viewer";

export function load(defaultConfiguration) {
  return PSPDFKit.load(defaultConfiguration).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    // You can find an introductions to annotations in our guides:
    // https://www.nutrient.io/guides/web/forms/introduction-to-forms/
    instance.getFormFields().then(function (formFields) {
      console.log("All form fields", formFields.toJS());

      instance.setFormFieldValues({
        "Client first and last name": "Nutrient Web SDK",
        "Description 1": "Loaded Nutrient Web SDK successfully",
        "Description 2": "Printed out all form fields in the JS Console",
        "Description 3": "Now filling out the form fields programmatically",
      });
    });

    return instance;
  });
}
