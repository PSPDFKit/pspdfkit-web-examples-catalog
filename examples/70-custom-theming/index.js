import PSPDFKit from "@nutrient-sdk/viewer";

import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

export function load(defaultConfiguration) {
  // Nutrient Web SDK freezes the Options object to prevent changes after the first load
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  const items = defaultConfiguration.toolbarItems.concat([
    { type: "content-editor" },
  ]);

  return PSPDFKit.load({
    ...defaultConfiguration,
    enableHistory: true,
    toolbarItems: items
      .reduce((acc, item) => {
        if (item.type === "polyline") {
          return acc.concat([item, { type: "undo" }, { type: "redo" }]);
        }

        if (item.type === "zoom-mode") {
          return acc.concat([
            item,
            { type: "undo", dropdownGroup: "history" },
            { type: "redo", dropdownGroup: "history" },
          ]);
        }

        return acc.concat([item]);
      }, [])
      .concat([
        { type: "cloudy-rectangle", dropdownGroup: "shapes" },
        { type: "dashed-rectangle", dropdownGroup: "shapes" },
        { type: "cloudy-ellipse", dropdownGroup: "shapes" },
        { type: "dashed-ellipse", dropdownGroup: "shapes" },
        { type: "dashed-polygon", dropdownGroup: "shapes" },
        { type: "content-editor", dropdownGroup: "editor" },
        { type: "form-creator", dropdownGroup: "editor" },
        { type: "measure", dropdownGroup: "editor" },
        { type: "document-comparison", dropdownGroup: "editor" },
      ]),
    theme: {
      elevation: {
        low: "0 0 4px 0 rgba(0, 0, 0, 0.4)",
        medium: "0 4px 16px 0 rgba(0, 0, 0, 0.15)",
      },
      opacity: {
        none: "0",
        low: "0.1",
        medium: "0.5",
        high: "0.9",
      },
      rounded: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        full: "9999px",
      },
      spacing: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
        "5xl": "48px",
        "6xl": "64px",
        "7xl": "80px",
        "8xl": "96px",
        "9xl": "160px",
      },
      color: {
        support: {
          error: {
            subtler: "#711b00",
            subtle: "#b53007",
            medium: "#fe7a68",
            strong: "#ffd4ce",
          },
          success: {
            subtler: "#223a03",
            subtle: "#3C6612",
            medium: "#80CC34",
            strong: "#ecfeda",
          },
          warning: {
            subtler: "#562800",
            subtle: "#bd5a00",
            medium: "#eb7f00",
            strong: "#ffd4a1",
          },
          info: {
            subtler: "#190d94",
            subtle: "#4537de",
            medium: "#777cf0",
            strong: "#d3dcff",
          },
        },
        focused: {
          default: "#FB6F3B",
          inset: "#5B1C0F",
        },
        background: {
          primary: {
            subtle: "#5B1C0F",
            medium: "#431207",
            strong: "#180501",
          },
          interactive: {
            enabled: "#FB6F3B",
            hovered: "#FEB609",
            active: "#FFC938",
            visited: "#FFC938",
            disabled: "rgb(84.7% 28.6% 16.1% / 0.5)",
          },
          inverse: {
            subtle: "#E95635",
            medium: "#FFC938",
            strong: "#FFE7A9",
          },
          secondary: {
            subtle: "#762B1A",
            medium: "#A93920",
            strong: "#D84929",
          },
          overlay: {
            subtle: "rgb(100% 90.6% 66.3% / 0.25)",
            medium: "rgb(9.41% 1.96% 0.39% / 0.5)",
            interactive: "rgb(98.4% 43.5% 23.1% / 0.25)",
          },
          positive: {
            subtle: "#FFC938",
            medium: "#FEDE89",
            strong: "#FFE7A9",
            interactive: {
              enabled: "#5B1C0F",
            },
          },
        },
        text: {
          primary: "#FFE7A9",
          secondary: "#FEB609",
          helper: "#FB6F3B",
          placeholder: "#FB6F3B",
          inverse: "#5B1C0F",
          oninteractive: "#5B1C0F",
          interactive: {
            enabled: "#FB6F3B",
            hovered: "#FEB609",
            active: "#FFC938",
            visited: "#FFC938",
            disabled: "rgb(100% 90.6% 66.3% / 0.5)",
          },
        },
        icon: {
          primary: "#FFE7A9",
          secondary: "#FB6F3B",
          inverse: "#5B1C0F",
          oninteractive: "#5B1C0F",
          interactive: {
            enabled: "#FB6F3B",
            hovered: "#FEB609",
            active: "#FFC938",
            visited: "#FFC938",
            disabled: "rgb(100% 90.6% 66.3% / 0.5)",
          },
        },
        border: {
          subtle: "#762B1A",
          medium: "#A93920",
          strong: "#D84929",
          inverse: "#FFE7A9",
          interactive: {
            enabled: "#FB6F3B",
            hovered: "#FEB609",
            active: "#FFC938",
            visited: "#FFC938",
            disabled: "#D84929",
          },
          positive: {
            interactive: {
              enabled: "#5B1C0F",
            },
            subtle: "#FFC938",
            medium: "#FEB609",
            strong: "#FB6F3B",
          },
        },
      },
      typography: {
        heading: {
          h6: {
            regular: {
              font: '400 0.875rem/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
            medium: {
              font: '500 0.875rem/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
            semibold: {
              font: '600 0.875rem/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
          },
          h5: {
            regular: {
              font: '400 1rem/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
            medium: {
              font: '500 1rem/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
            semibold: {
              font: '600 1rem/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
          },
          h4: {
            regular: {
              font: '400 1.375rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0",
            },
            medium: {
              font: '500 1.375rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0",
            },
            semibold: {
              font: '600 1.375rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0",
            },
          },
          h3: {
            regular: {
              font: '400 1.5rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0",
            },
            medium: {
              font: '500 1.5rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0",
            },
            semibold: {
              font: '600 1.5rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0",
            },
          },
          h2: {
            regular: {
              font: '400 1.75rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0",
            },
            medium: {
              font: '500 1.75rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0",
            },
            semibold: {
              font: '600 1.75rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0",
            },
          },
          h1: {
            regular: {
              font: '400 2rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0",
            },
            medium: {
              font: '500 2rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0",
            },
            semibold: {
              font: '600 2rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0",
            },
          },
        },
        label: {
          sm: {
            regular: {
              font: '400 0.688rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.05px",
            },
            medium: {
              font: '500 0.688rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.05px",
            },
            semibold: {
              font: '600 0.688rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.05px",
            },
          },
          md: {
            regular: {
              font: '400 0.75rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
            medium: {
              font: '500 0.75rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
            semibold: {
              font: '600 0.75rem/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
          },
          lg: {
            regular: {
              font: '400 0.875rem/1.375 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
            medium: {
              font: '500 0.875rem/1.375 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
            semibold: {
              font: '600 0.875rem/1.375 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
          },
        },
        body: {
          sm: {
            regular: {
              font: '400 0.75rem/1.375 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.05px",
            },
            medium: {
              font: '500 0.75rem/1.375 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.05px",
            },
            semibold: {
              font: '600 0.75rem/1.375 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.05px",
            },
          },
          md: {
            regular: {
              font: '400 0.875rem/1.375 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
            medium: {
              font: '500 0.875rem/1.375 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
            semibold: {
              font: '600 0.875rem/1.375 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
          },
          lg: {
            regular: {
              font: '400 1rem/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
            medium: {
              font: '500 1rem/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
            semibold: {
              font: '600 1rem/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
              letterSpacing: "0.1px",
            },
          },
        },
      },
    },
  }).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
}
