import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: [
      ...PSPDFKit.defaultToolbarItems,
      {
        type: "form-creator",
      },
    ],
    initialViewState: new PSPDFKit.ViewState({
      interactionMode: PSPDFKit.InteractionMode.FORM_CREATOR,
    }),
  }).then((instance) => {
    window.instance = instance;
  });
}
