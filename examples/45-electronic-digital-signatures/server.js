import PSPDFKit from "@nutrient-sdk/viewer";

import { convertElectronicToVisibleDigitalSignature } from "./electronicDigitalSignatures";
import { dialog } from "./static/utils";
import { createSignaturesInfoNode } from "./static/signaturesInfoSidebar";

let instance;

export default async function load(defaultConfiguration) {
  const signaturesInfoSrc = await fetch(
    `${location.pathname}/static/signaturesInfoSidebar.html`
  ).then((response) => response.text());

  const signatureInfoSidebarTitle = "Signatures Info";

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: [
      {
        type: "custom",
        title: signatureInfoSidebarTitle,
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
                  item.title === signatureInfoSidebarTitle
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
                  item.title === signatureInfoSidebarTitle
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
      { type: "signature" },
      { type: "export-pdf" },
    ],
    styleSheets: [`${location.pathname}/static/styles.css`],
    initialViewState: new PSPDFKit.ViewState({
      sidebarMode: PSPDFKit.SidebarMode.CUSTOM,
    }),
    customUI: {
      [PSPDFKit.UIElement.Sidebar]: {
        [PSPDFKit.SidebarMode.CUSTOM]({ containerNode }) {
          if (
            instance &&
            containerNode &&
            !containerNode.querySelector(".signaturesInfo")
          ) {
            containerNode.append(
              createSignaturesInfoNode(instance, signaturesInfoSrc)
            );
          }
        },
      },
    },
  }).then(async (_instance) => {
    instance = _instance;
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    instance.addEventListener("annotations.create", (annotations) =>
      convertElectronicToVisibleDigitalSignature(
        instance,
        annotations.first(),
        false
      )
    );

    dialog(
      instance,
      "Add an Electronic Signature with the signature dialog and it will be converted to a Digital Signature."
    );

    return instance;
  });
}
