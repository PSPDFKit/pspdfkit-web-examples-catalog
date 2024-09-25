import PSPDFKit from "pspdfkit";

import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

const SvgXIcon = ({ title, titleId, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || "1em"}
    height={props.size || "1em"}
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g clipPath="url(#x-icon_svg__a)">
      <path
        fillRule="evenodd"
        d="M16.894 3.106a.75.75 0 0 1 0 1.06L11.061 10l5.833 5.834a.75.75 0 0 1-1.06 1.06L10 11.061l-5.834 5.833a.75.75 0 1 1-1.06-1.06L8.939 10 3.106 4.166a.75.75 0 0 1 1.06-1.06L10 8.939l5.834-5.833a.75.75 0 0 1 1.06 0"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="x-icon_svg__a">
        <path d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
);

export function load(defaultConfiguration) {
  const { createBlock, Core, Interfaces, Recipes } = PSPDFKit.UI;

  // PSPDFKit freezes the Options object to prevent changes after the first load
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
                createBlock(Core.ActionIconButton, {
                  icon: SvgXIcon,
                  onPress: props.onCloseRequest,
                  variant: "secondary",
                  "aria-label": "Close",
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
              const previewBlocks = [...props.fonts, "Helvetica", "Arial"].map(
                (font) =>
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
  }).then((instance) => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    return instance;
  });
}
