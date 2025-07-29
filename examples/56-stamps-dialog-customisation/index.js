import PSPDFKit from "@nutrient-sdk/viewer";

const STORAGE_KEY = "examples/stamps-dialog-customisation/filteredItems";

export function load(defaultConfiguration) {
  const { createBlock, Interfaces, Recipes, Core } = PSPDFKit.UI;

  const stampAnnotationTemplates = PSPDFKit.defaultStampAnnotationTemplates;

  // Add a custom stamp to the list of available stamps
  stampAnnotationTemplates.unshift(
    new PSPDFKit.Annotations.StampAnnotation({
      stampType: "Custom",
      title: "My custom text",
      color: new PSPDFKit.Color({ r: 0, g: 0, b: 64 }),
      subtitle: "my custom subtitle",
      boundingBox: new PSPDFKit.Geometry.Rect({
        left: 0,
        top: 0,
        width: 300,
        height: 100,
      }),
    })
  );

  return PSPDFKit.load({
    ...defaultConfiguration,
    // Set the stamp annotation templates with the custom stamp too
    stampAnnotationTemplates: stampAnnotationTemplates,
    ui: {
      _blocks: {
        // Override the StampsList component to add a delete button to each stamp
        [Interfaces.StampsList]: ({ props }) => {
          // We store the filtered items in local storage so that they persist across reloads
          const initialState = {
            ...props.initialState,
            filteredItems:
              JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || [],
          };

          return {
            content: createBlock(
              Recipes.StampsList,
              { ...props, initialState },
              ({ ui, state }) => {
                // Repurpose the "Add Stamps" button to restore the stamps
                // which were previously removed from the list. This button will
                // only be enabled if there are stamps to restore.
                ui.getBlockById("stamp-presets-button").mergeProps({
                  label: "Restore Stamps",
                  onPress: () => {
                    window.localStorage.removeItem(STORAGE_KEY);
                    state.set("filteredItems", []);
                  },
                  isDisabled: !(
                    state.get("filteredItems") &&
                    state.get("filteredItems").length
                  ),
                });

                // Filter out the stamps that were removed from the list. It's important
                // to keep in mind that it's better to bank on the data in the props than the
                // structure of blocks to avoid issues with state updates.
                const previewIds = [
                  ...new Set(props.items.map((item) => item["aria-label"])),
                ];

                // Filter out the stamps that were removed from the list
                const filtered = previewIds
                  .filter(
                    (previewId) =>
                      !state.get("filteredItems").includes(previewId)
                  )
                  // Add a delete button to each stamp preview block
                  // that will remove the stamp from the list
                  .map((previewId) => {
                    const _preview = ui
                      .getBlocksByComponent(Core.Preview)
                      .find(
                        (preview) => preview.props["aria-label"] === previewId
                      );

                    return _preview
                      .setProp("onDelete", () => {
                        const filteredItems = [
                          ...(state.get("filteredItems") || []),
                          previewId,
                        ];
                        state.set("filteredItems", filteredItems);
                        window.localStorage.setItem(
                          STORAGE_KEY,
                          JSON.stringify(filteredItems)
                        );
                      })
                      .setProp("key", previewId)
                      .setProp("addAriaLabel", previewId)
                      .setProp("deleteAriaLabel", `Delete ${previewId}`);
                  });

                // Replace the children of the body block with the filtered stamps
                const body = ui.getBlockById("body");
                body.children = filtered;

                return ui.createComponent();
              }
            ).createComponent(),
          };
        },
      },
    },
  }).then(async (instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
}
