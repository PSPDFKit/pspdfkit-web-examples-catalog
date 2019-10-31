import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  return PSPDFKit.load(defaultConfiguration).then(instance => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    // You can find an introductions to annotations in our guides:
    // https://pspdfkit.com/guides/web/current/forms/introduction-to-forms/
    instance.getFormFields().then(function(formFields) {
      console.log("All form fields", formFields.toJS());

      instance.setFormFieldValues({
        "Client name": "PSPDFKit",
        "Description 1": "Loaded PSPDFKit successfully",
        "Description 2": "Printed out all form fields in the JS Console",
        "Description 3": "Now filling out the form fields programmatically"
      });
    });

    return instance;
  });
}
