import PSPDFKit from "pspdfkit";
import { attachListeners, initialToolbarItems } from "./index";

let instance = null;

const buttons = {
  saveButton: null,
  finishButton: {
    type: "custom",
    title: "Finish Signing",
    className: "finish-signing",
    name: "sign",
    async onPress() {
      // When "Finish Signing" is pressed, after the user
      // has added an ink signature, we proceed to apply
      // a digital signature to the document. From this
      // point on the integrity of the file is guaranteed.
      try {
        await instance.signDocument(null, {
          // The example signing microservice we are using
          // expects the "user-1-with-rights" token when
          // invoking its endpoint. PSPDFKit Server forwards
          // any value specified in "signingToken" to it.
          signingToken: "user-1-with-rights",
        });
        console.log("New signature added to the document!");
      } catch (error) {
        console.error(error);
      }
    },
  },
  resetButton: {
    type: "custom",
    title: "Reset",
    name: "reset",
    async onPress() {
      localStorage.removeItem(
        "examples/digital-signatures-sign/lastUsedServerDocumentId"
      );
      location.href = "/digital-signatures-sign";
    },
  },
};

export default function load(defaultConfiguration) {
  const { toolbarItems } = defaultConfiguration;

  // split the rest of the toolbar items from the save button so that
  // later we can keep it as the last item while adding the sign button
  buttons.saveButton = toolbarItems[toolbarItems.length - 1];

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: initialToolbarItems,
    styleSheets: ["/digital-signatures-sign/static/styles.css"],
    initialViewState: new PSPDFKit.ViewState({
      showSignatureValidationStatus:
        PSPDFKit.ShowSignatureValidationStatusMode.IF_SIGNED,
    }),
  }).then(async (_instance) => {
    instance = _instance;
    console.log("PSPDFKit for Web successfully loaded!!", instance);
    attachListeners(instance, buttons);

    return instance;
  });
}
