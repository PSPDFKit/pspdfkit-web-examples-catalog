import PSPDFKit from "pspdfkit";

// Node creation helper, it returns a new `div` with the provided class name,
// and appends the html content to it if provided, plus an icon for signature fields.
const createNode = (html, className) => {
  const div = document.createElement("div");
  div.className = className;
  if (!html) {
    return div;
  }
  // Only the signature widget nodes use the icon
  div.innerHTML = html;
  const container = document.createElement("div");
  container.appendChild(div);
  const divIcon = document.createElement("div");
  divIcon.className = "signatureIcon";
  divIcon.innerHTML =
    '<div><img src="customize-annotations/static/signature.svg" style="height: 100%; width: auto" /></div>';
  container.appendChild(divIcon);
  return container;
};

const renderConfigurations = {};

const getAnnotationRenderers = ({ annotation }) => {
  // Use cached render configuration
  if (renderConfigurations[annotation.id]) {
    return renderConfigurations[annotation.id];
  }
  switch (true) {
    case annotation.formFieldName === "Signature Provider 2":
      renderConfigurations[annotation.id] = {
        // DOM node to be rendered along, or instead of, the normal annotation appearance.
        node: createNode(
          '<img src="customize-annotations/static/sign-here-right.svg" />',
          "signHereRight"
        ),
        // Optional, default: false. Set to true if the node should be appended instead of replacing the normal annotation appearance.
        append: true
      };
      break;
    case annotation.formFieldName === "Signature Provider 3":
      renderConfigurations[annotation.id] = {
        node: createNode(
          '<img src="customize-annotations/static/sign-here-left.svg" />',
          "signHereLeft"
        ),
        append: true
      };
      break;
    case annotation instanceof PSPDFKit.Annotations.WidgetAnnotation:
      renderConfigurations[annotation.id] = {
        node: createNode(null, "emptyField"),
        append: true
      };
      break;
  }
  return renderConfigurations[annotation.id] || null;
};

export function load(defaultConfiguration) {
  // Add a callback to the 'Annotation' key in the `customRenderers` configuration field to customize
  // the annotation's appearance by adding a DOM node to it (or replacing the annotation's content
  // entirely wit the node).
  const customRenderers = {
    Annotation: getAnnotationRenderers
  };

  return PSPDFKit.load({
    ...defaultConfiguration,
    styleSheets: ["/customize-annotations/static/style.css"],
    customRenderers
  }).then(instance => {
    instance.addEventListener("formFieldValues.update", formFields => {
      for (let i = 0; i < instance.totalPageCount; i++) {
        instance.getAnnotations(i).then(annotations => {
          annotations.forEach(annotation => {
            const formField = formFields.find(
              formField => annotation.formFieldName === formField.name
            );
            if (formField) {
              renderConfigurations[annotation.id].node.className =
                formField.value == null ? "emptyField" : "filledField";
            }
          });
        });
      }
    });

    return instance;
  });
}
