import PSPDFKit from "@nutrient-sdk/viewer";

import { createSigningFormNode } from "./static/signingSidebar";
import { dialog } from "./static/utils";
import { sign } from "./static/sign-server";

let instance;

export default async function load(defaultConfiguration) {
  const signingFormSrc = await fetch(
    `${location.pathname}/static/signingSidebar.html`
  ).then((response) => response.text());

  const signingSidebarTitle = "Signing panel";

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: [
      {
        type: "custom",
        title: signingSidebarTitle,
        selected: true,
        onPress: () => {
          if (instance.viewState.sidebarMode === PSPDFKit.SidebarMode.CUSTOM) {
            instance.setViewState((viewState) =>
              viewState.set("sidebarMode", null)
            );
            instance.setToolbarItems((items) =>
              items.map((item) => {
                if (
                  item.type === "custom" &&
                  item.title === signingSidebarTitle
                ) {
                  return { ...item, selected: false };
                }

                return item;
              })
            );
          } else {
            instance.setViewState((viewState) =>
              viewState.set("sidebarMode", PSPDFKit.SidebarMode.CUSTOM)
            );
            instance.setToolbarItems((items) =>
              items.map((item) => {
                if (
                  item.type === "custom" &&
                  item.title === signingSidebarTitle
                ) {
                  return { ...item, selected: true };
                }

                return item;
              })
            );
          }
        },
      },
      { type: "spacer" },
      { type: "export-pdf" },
    ],
    styleSheets: [`${location.pathname}/static/styles.css`],
    initialViewState: new PSPDFKit.ViewState({
      showSignatureValidationStatus:
        PSPDFKit.ShowSignatureValidationStatusMode.IF_SIGNED,
      sidebarMode: PSPDFKit.SidebarMode.CUSTOM,
    }),
    async trustedCAsCallback() {
      // The particular certificate + private key that we are going to use
      // for signing this example were issued by this CA that we are going
      // to use for validation after signing.
      const certificate = await fetch(
        `${location.pathname}/static/ca.pem`
      ).then((response) => response.text());

      return [certificate];
    },
    customUI: {
      [PSPDFKit.UIElement.Sidebar]: {
        [PSPDFKit.SidebarMode.CUSTOM]({ containerNode }) {
          if (
            instance &&
            containerNode &&
            !containerNode.querySelector(".signingForm")
          ) {
            containerNode.append(
              createSigningFormNode(instance, signingFormSrc, sign, false)
            );
          }
        },
      },
    },
    isEditableAnnotation: () => false,
  }).then(async (_instance) => {
    instance = _instance;
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    dialog(
      instance,
      "Use the sidebar form to configure and add your visible digital signature to the document."
    );

    return instance;
  });
}
