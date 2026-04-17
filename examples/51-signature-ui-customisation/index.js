import PSPDFKit from "@nutrient-sdk/viewer";

import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

export function load(defaultConfiguration) {
  const { createBlock, Core, Interfaces, Recipes } = PSPDFKit.UI;

  // Nutrient Web SDK freezes the Options object to prevent changes after the first load
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  // PSPDFKit.Configuration#authPayload is a Server only property.
  // We check for its presence to determine if content-editor should be added
  const items = defaultConfiguration.toolbarItems.concat(
    defaultConfiguration.authPayload ? [] : [{ type: "content-editor" }]
  );

  return PSPDFKit.load({
    ...defaultConfiguration,
    enableHistory: true,
    toolbarItems: items.reduce((acc, item) => {
      if (item.type === "polyline") {
        return acc.concat([item, { type: "undo" }, { type: "redo" }]);
      }

      return acc.concat([item]);
    }, []),
    ui: {
      _blocks: {
        [Interfaces.CreateSignature]: ({ props }) => {
          return {
            content: createBlock(
              Recipes.CreateSignature,
              props,
              ({ ui, state }) => {
                // Remove the footer from the Modal
                ui.removeChildById("footer");

                // Change the title text of the Modal
                ui.getBlockById("title").children = "Custom Signature";

                // Add a close button to the header of the Modal which is positioned after the title
                // The button will close the Modal when clicked.
                ui.insertAfter(
                  "title",
                  createBlock(Core.ActionButton, {
                    onPress: props.onCloseRequest,
                    variant: "secondary",
                    label: "Close",
                  })
                );

                // Change the style of the header to update styling
                // The header is the top part of the Modal that contains the title and close button
                ui.getBlockById("header").mergeProps({
                  style: {
                    paddingBlock: 12,
                    paddingInlineEnd: 12,
                  },
                });

                // Create a list of preview blocks for each font in the list. When a preview block is clicked,
                // the signature is added to the document with the selected font and color.
                const previewBlocks = [
                  ...props.fonts,
                  "Helvetica",
                  "Arial",
                ].map((font) =>
                  createBlock(Core.Preview, {
                    textValue: state.get("textValue") || "Placeholder",
                    textStyle: {
                      fontFamily: font,
                      color: state.get("color"),
                    },
                    style: { flex: 1 },
                    isDisabled: !state.get("textValue"),
                    onPress: () => {
                      props.onAdd({
                        signature: {
                          type: "type",
                          value: state.get("textValue") || "Placeholder",
                        },
                        color: state.get("color"),
                        selectedFont: font,
                      });
                      props.onCloseRequest();
                    },
                    key: font,
                  })
                );

                // We wrap the preview blocks in a box to ensure they are displayed in a row
                // and wrap to the next line when the width of the box is exceeded.
                const box = createBlock(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexDirection: "row",
                      gap: 8,
                      margin: 24,
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                    },
                  },
                  ...previewBlocks
                );

                // Add a text input at the top of the Modal to allow the user to enter their name
                // followed by a color selector to allow the user to select the color of the signature.
                // In the end we append the box with the preview blocks.
                ui.getBlockById("body").appendChildren(
                  createBlock(Core.TextInput, {
                    label: "Name",
                    "data-blockid": "name-input",
                    description: "Enter name to enable selection",
                    placeholder: "Your name here",
                    style: {
                      paddingInline: 24,
                      marginTop: 16,
                    },
                    onChange: (value) => state.set("textValue", value),
                  }),
                  ui.getBlockById("color-selector").setProp("style", {
                    maxWidth: "100%",
                    paddingInline: 24,
                    marginTop: 16,
                  }),
                  box
                );

                // Remove the tabs from the Modal that were present in the original modal
                ui.removeChildById("tabs");

                // Return the final UI component.
                return ui.createComponent();
              }
            ).createComponent(),
          };
        },
      },
    },
  }).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
}
