/*
 *  In this example we hide the default annotation
 *  toolbar in favor of our own custom UI widget to
 *  visualize the current value of the annotations properties
 *  and let the user update them at will. We call it "annotation inspector".
 *
 *  We specify our own DOM node to render as an annotation
 *  tooltip, attach several DOM form controls to it, and
 *  update the annotation properties with the new values.
 *
 *  Additionally, we specify our own custom CSS style sheet
 *  to customize the appearance of our tooltip at will.
 *
 *  To keep the example simple, with minimal dependencies,
 *  we are only using the browser’s native controls and DOM API.
 */

import PSPDFKit from "pspdfkit";

let instance = null;

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    styleSheets: ["/annotations-inspector/static/style.css"],
    annotationTooltipCallback: getAnnotationInspector,
    initialViewState: new PSPDFKit.ViewState({
      enableAnnotationToolbar: false,
    }),
  }).then((_instance) => {
    instance = _instance;

    return instance;
  });
}

// cache of inspector DOM elements to reuse the existing ones in case
// the user is selecting the same annotation again after the first time.
let inspectors = {};

function getAnnotationInspector(annotation) {
  let container;

  if (
    !inspectors[annotation.id] ||
    inspectors[annotation.id].children.length === 0
  ) {
    // There's a bug on IE 11 where the cached div can be empty
    // so if it doesn't contain any children we recreate the container
    container = document.createElement("div");
    container.className = "annotation-inspector";

    const { sections, title } = getPropertiesByType(annotation);

    const header = document.createElement("header");

    header.innerHTML = `<h1>${title}</h1>`;
    container.appendChild(header);
    sections.forEach((section) => {
      container.appendChild(section);
    });
    inspectors[annotation.id] = container;
  }

  container = inspectors[annotation.id];

  return [
    {
      type: "custom",
      id: "annotation-tooltip",
      className: "annotation-tooltip-container",
      node: container,
    },
  ];
}

// By default we would like to have the inspector tooltip sections collapsed
// until a certain breakpoint (for better UX on mobile devices) and expanded
// on larger viewport dimensions (like tablets or desktop).
const COLLAPSE_BY_DEFAULT_HEIGHT = 850;
const COLLAPSE_BY_DEFAULT_WIDTH = 600;

// Construct the DOM tree for the different sections to display according
// to the current annotation type.
function getPropertiesByType(annotation) {
  const sections = [];
  let title;
  const pushSectionForType = (annotationKey, label) => {
    const ul = document.createElement("ul");

    Object.keys(annotationsMap[annotationKey]).forEach((prop) => {
      const { label, getElements, icon } = annotationsMap[annotationKey][prop];
      const domElements = getElements();

      if (Array.isArray(domElements) && domElements.length > 0) {
        ul.appendChild(generateListItem(label, prop, domElements, icon));
      }
    });

    // If there's enough width the inspector can be rendered on the sides of
    // the annotation even when the height of the viewport wouldn't be enough
    const shouldCollapseSectionsByDefault =
      window.innerHeight <= COLLAPSE_BY_DEFAULT_HEIGHT &&
      window.innerWidth <= COLLAPSE_BY_DEFAULT_WIDTH;

    if (shouldCollapseSectionsByDefault) {
      ul.classList.toggle("collapsed-list");
    }

    const sectionIcon = shouldCollapseSectionsByDefault
      ? "panel-expand.svg"
      : "panel-collapse.svg";
    const sectionEl = document.createElement("section");
    const collapseBtn = document.createElement("button");

    collapseBtn.className = "collapse-toggle-button";

    const collapseImg = document.createElement("img");

    collapseImg.src = `/annotations-inspector/static/${sectionIcon}`;
    collapseImg.setAttribute("alt", "Expand");
    collapseBtn.appendChild(collapseImg);
    collapseBtn.id = `collapse-${annotationKey}`;

    const sectionDiv = document.createElement("div");

    sectionDiv.className = "section-title";
    sectionDiv.innerHTML = `<label class="group-title" for="${collapseBtn.id}">${label}</label>`;
    sectionDiv.firstChild.appendChild(collapseBtn);
    sectionEl.appendChild(sectionDiv);
    sectionEl.appendChild(ul);
    collapseBtn.addEventListener("click", () => {
      if (ul.classList.contains("collapsed-list")) {
        collapseImg.src = "/annotations-inspector/static/panel-collapse.svg";
        collapseImg.setAttribute("alt", "Collapse");
      } else {
        collapseImg.src = "/annotations-inspector/static/panel-expand.svg";
        collapseImg.setAttribute("alt", "Expand");
      }

      ul.classList.toggle("collapsed-list");
    });
    sections.push(sectionEl);
  };

  pushSectionForType("annotation", "Container style");

  if (annotation instanceof PSPDFKit.Annotations.ShapeAnnotation) {
    pushSectionForType("shapeAnnotation", "Shape style");
    title = "Shape annotation properties";
  } else if (annotation instanceof PSPDFKit.Annotations.InkAnnotation) {
    pushSectionForType("inkAnnotation", "Ink style");
    title = "Ink annotation properties";
  } else if (annotation instanceof PSPDFKit.Annotations.TextAnnotation) {
    pushSectionForType("textAnnotation", "Text style");
    title = "Text annotation properties";
  } else if (annotation instanceof PSPDFKit.Annotations.NoteAnnotation) {
    pushSectionForType("noteAnnotation", "Note style");
  } else if (annotation instanceof PSPDFKit.Annotations.HighlightAnnotation) {
    pushSectionForType("highlightAnnotation", "Highlight style");
    title = "Highlight annotation properties";
  }

  // we reverse the array to show the most specific properties first
  return { title, sections: sections.reverse() };
}

// Generate a row for the annotation inspector for a given property.
function generateListItem(label, key, domElements, icon) {
  const li = document.createElement("li");
  const valueSpan = document.createElement("span");

  valueSpan.className = "val";

  if (Array.isArray(domElements)) {
    domElements.forEach((el) => {
      valueSpan.appendChild(el);
    });
  }

  li.innerHTML = `<span class="attr"><img src="${icon}" class="property-icon" aria-hidden="true" alt=""> ${label}</span>`;
  li.appendChild(valueSpan);

  return li;
}

const blendModes = [
  { label: "Normal", value: "normal" },
  { label: "Multiply", value: "multiply" },
  { label: "Screen", value: "screen" },
  { label: "Overlay", value: "overlay" },
  { label: "Darken", value: "darken" },
  { label: "Lighten", value: "lighten" },
  { label: "Color Dodge", value: "colorDodge" },
  { label: "Color Burn", value: "colorBurn" },
  { label: "Hard Light", value: "hardLight" },
  { label: "Soft Light", value: "softLight" },
  { label: "Difference", value: "difference" },
  { label: "Exclusion", value: "exclusion" },
];

const ASSETS_PATH = "/annotations-inspector/static";

// Base radius for cloudy border arcs. It's multiplied by
// cloudyBorderIntensity to obtain the actual radius. The
// strokeWidth is added to get a working value for
// cloudyBorderInset so that its size is slightly less than
// the boundingBox, to make it fit nicely.
const CLOUD_BORDER_EFFECT_BASE_RADIUS = 4.25;

// Object with the properties to display in inspector by type.
// We specify for each property the DOM element that we want
// to render on the inspector. For this, we prepared some
// generic implementations but we provide custom code
// for specific cases.
const annotationsMap = {
  annotation: {
    opacity: {
      label: "Opacity",
      icon: `${ASSETS_PATH}/opacity.svg`,
      getElements: () => {
        if (
          !(
            instance.getSelectedAnnotation() instanceof
            PSPDFKit.Annotations.NoteAnnotation
          )
        ) {
          return numberInput("opacity", { max: 1, step: 0.01, type: "range" });
        }
      },
    },
  },
  shapeAnnotation: {
    fillColor: {
      label: "Fill color",
      icon: `${ASSETS_PATH}/fill-color.svg`,
      getElements: () => colorPicker("fillColor"),
    },
    strokeColor: {
      label: "Stroke color",
      icon: `${ASSETS_PATH}/color.svg`,
      getElements: () => colorPicker("strokeColor"),
    },
    strokeWidth: {
      label: "Stroke width",
      icon: `${ASSETS_PATH}/stroke-width.svg`,
      getElements: () => numberInput("strokeWidth", { min: 0, step: 0.5 }),
    },
    strokeDashArray: {
      label: "Line style",
      icon: `${ASSETS_PATH}/line-style.svg`,
      getElements: () => {
        const annotation = instance.getSelectedAnnotation();
        const possibleValues = [
          { label: "solid", value: null },
          { label: "dashed", value: [1, 1] },
          { label: "dotted", value: [1, 3] },
          { label: "dashed (3)", value: [3, 3] },
          { label: "dashed (6)", value: [6, 6] },
        ];

        if ("cloudyBorderIntensity" in annotation) {
          // Cloudy style is only supported on a subset of shape annotations
          possibleValues.push({ label: "cloudy", value: null });
        }

        const [select] = createSelectField("strokeDashArray", possibleValues);

        // Add another event listener to update the
        // "cloudyBorderIntensity" property when "cloudy"
        // is selected
        if (instance.getSelectedAnnotation().cloudyBorderIntensity > 0) {
          select.selectedIndex = 5;
        }

        select.addEventListener("change", (e) => {
          const annotation = instance.getSelectedAnnotation();

          if (e.target.selectedIndex === 5) {
            // For cloudy borders, we set "strokeDashArray" to null
            // but specify "cloudyBorderIntensity" and "cloudyBorderInset"
            const inset =
              CLOUD_BORDER_EFFECT_BASE_RADIUS * 2 + annotation.strokeWidth / 2;
            const updatedAnnotation = annotation
              .set("cloudyBorderIntensity", 2)
              .set(
                "cloudyBorderInset",
                PSPDFKit.Geometry.Inset.fromValue(inset)
              );

            instance.update(updatedAnnotation);
          } else if (annotation.cloudyBorderIntensity > 0) {
            const updatedAnnotation = annotation.set(
              "cloudyBorderIntensity",
              0
            );

            instance.update(updatedAnnotation);
          }
        });

        return [select];
      },
    },
  },
  inkAnnotation: {
    lineWidth: {
      label: "Line width",
      icon: `${ASSETS_PATH}/stroke-width.svg`,
      getElements: () => numberInput("lineWidth", { min: 0, step: 0.5 }),
    },
    strokeColor: {
      label: "Stroke color",
      icon: `${ASSETS_PATH}/color.svg`,
      getElements: () => colorPicker("strokeColor"),
    },
    backgroundColor: {
      label: "Background",
      icon: `${ASSETS_PATH}/fill-color.svg`,
      getElements: () => colorPicker("backgroundColor"),
    },
    blendMode: {
      label: "Blend mode",
      icon: `${ASSETS_PATH}/blend-mode.svg`,
      getElements: () => createSelectField("blendMode", blendModes),
    },
  },
  textAnnotation: {
    font: {
      label: "Font",
      icon: `${ASSETS_PATH}/font.svg`,
      getElements: () =>
        createSelectField("font", [
          "Helvetica",
          "Arial",
          "Calibri",
          "Century Gothic",
          "Consolas",
          "Courier",
          "Dejavu Sans",
          "Dejavu Serif",
          "Georgia",
          "Gill Sans",
          "Impact",
          "Lucida Sans",
          "Myriad Pro",
          "Open Sans",
          "Palatino",
          "Tahoma",
          "Times New Roman",
          "Trebuchet",
          "Verdana",
          "Zapfino",
          "Comic Sans",
        ]),
    },
    fontSyle: {
      label: "Font style",
      icon: `${ASSETS_PATH}/font-style.svg`,
      getElements: () =>
        toggleFields(["isItalic", "isBold"], {
          type: "checkbox",
          options: [
            {
              label: "Italic",
              icon: `${ASSETS_PATH}/italic.svg`,
            },
            {
              label: "Bold",
              icon: `${ASSETS_PATH}/bold.svg`,
            },
          ],
        }),
    },
    fontSize: {
      label: "Text size",
      icon: `${ASSETS_PATH}/font-size.svg`,
      getElements: () => numberInput("fontSize", { min: 0, step: 1 }),
    },
    fontColor: {
      label: "Text color",
      icon: `${ASSETS_PATH}/color.svg`,
      getElements: () => colorPicker("fontColor"),
    },
    horizontalAlign: {
      label: "Horizontal alignment",
      icon: `${ASSETS_PATH}/text-align-horizontal.svg`,
      getElements: () =>
        toggleFields("horizontalAlign", {
          options: [
            {
              label: "Left",
              value: "left",
              icon: `${ASSETS_PATH}/align-left.svg`,
            },
            {
              label: "Center",
              value: "center",
              icon: `${ASSETS_PATH}/align-center.svg`,
            },
            {
              label: "Right",
              value: "right",
              icon: `${ASSETS_PATH}/align-right.svg`,
            },
          ],
        }),
    },
    verticalAlign: {
      label: "Vertical alignment",
      icon: `${ASSETS_PATH}/text-align-vertical.svg`,
      getElements: () =>
        toggleFields("verticalAlign", {
          options: [
            {
              label: "Top",
              value: "top",
              icon: `${ASSETS_PATH}/align-top.svg`,
            },
            {
              label: "Center",
              value: "center",
              icon: `${ASSETS_PATH}/align-vcenter.svg`,
            },
            {
              label: "Bottom",
              value: "bottom",
              icon: `${ASSETS_PATH}/align-bottom.svg`,
            },
          ],
        }),
    },
    backgroundColor: {
      label: "Background",
      icon: `${ASSETS_PATH}/fill-color.svg`,
      getElements: () => colorPicker("backgroundColor"),
    },
  },
  noteAnnotation: {
    color: {
      label: "Background",
      icon: `${ASSETS_PATH}/fill-color.svg`,
      getElements: () => colorPicker("color", false),
    },
    icon: {
      label: "Icon",
      icon: `${ASSETS_PATH}/color.svg`,
      getElements: () =>
        createSelectField("icon", [
          { label: "Comment", value: "COMMENT" },
          { label: "Right Pointer", value: "RIGHT_POINTER" },
          { label: "Right Arrow", value: "RIGHT_ARROW" },
          { label: "Check", value: "CHECK" },
          { label: "Circle", value: "CIRCLE" },
          { label: "Cross", value: "CROSS" },
          { label: "Insert", value: "INSERT" },
          { label: "New Paragraph", value: "NEW_PARAGRAPH" },
          { label: "Note", value: "NOTE" },
          { label: "Paragraph", value: "PARAGRAPH" },
          { label: "Help", value: "HELP" },
          { label: "Star", value: "STAR" },
          { label: "Key", value: "KEY" },
        ]),
    },
  },
  highlightAnnotation: {
    color: {
      label: "Color",
      icon: `${ASSETS_PATH}/color.svg`,
      getElements: () => colorPicker("color"),
    },
    blendMode: {
      label: "Blend mode",
      icon: `${ASSETS_PATH}/blend-mode.svg`,
      getElements: () => createSelectField("blendMode", blendModes),
    },
  },
};

// Generator of input[type="color"] elements (with a fallback to
// input[type="text"] for IE 11).
function colorPicker(prop, nullable = true) {
  const currentColor = instance.getSelectedAnnotation()[prop];
  const colorPicker = document.createElement("input");

  try {
    colorPicker.type = "color";
  } catch (e) {
    colorPicker.type = "text";
    colorPicker.className = "annotation-input";
    colorPicker.placeholder = "(e.g.: #ff00aa)";
  }

  colorPicker.name = prop;
  colorPicker.value = currentColor
    ? // input[type="color"] only support hexadecimal
      // values.
      rgbToHex(currentColor.toCSSValue())
    : "#ffffff";

  // Event handler for "change" events. We throttle it
  // to prevent multiple calls when the user is exploring
  // color options using the browser's color picker wheel.
  const throttledChange = throttled(50, (event) => {
    const updatedAnnotation = instance
      .getSelectedAnnotation()
      // we need to convert the hex value representation used by the
      // input[type="color"] element to the RGB value expected.
      .set(prop, new PSPDFKit.Color(hexToRgb(event.target.value)));

    instance.update(updatedAnnotation);
  });

  colorPicker.addEventListener("change", throttledChange);

  if (nullable) {
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.name = `transparent-${prop}`;
    checkbox.checked = instance.getSelectedAnnotation()[prop];

    if (!checkbox.checked) {
      colorPicker.style.visibility = "hidden";
    }

    checkbox.addEventListener("change", (e) => {
      colorPicker.style.visibility = e.target.checked ? "visible" : "hidden";

      const updatedAnnotation = instance.getSelectedAnnotation().set(
        prop,
        e.target.checked
          ? // we need to convert the hex value representation used by the
            // input[type="color"] element to the RGB value expected.
            new PSPDFKit.Color(hexToRgb(colorPicker.value))
          : null
      );

      instance.update(updatedAnnotation);
    });

    return [checkbox, colorPicker];
  }

  return [colorPicker];
}

// Generator of either input[type="number"] or input[type="range"]
// elements, according to the "type" property received as a parameter.
function numberInput(prop, { min = 0, step, max, type = "number" }) {
  const input = document.createElement("input");

  input.type = type;
  input.className = type === "number" ? "annotation-input" : "annotation-range";
  input.name = prop;
  input.min = min;

  if (step) {
    input.step = step;
  }

  if (max) {
    input.max = max;
  }

  input.value = instance.getSelectedAnnotation()[prop];

  let label;

  if (type === "range") {
    label = document.createElement("label");
    label.style.width = "2em";
    label.style.display = "inline-block";
    label.innerText = input.value;
  }

  // for input[type="number"] we listen to the "input" event
  // to prevent an edge case on mobile devices when the annotation
  // is deselected but the current value has changed.
  const event = type === "range" ? "change" : "input";

  input.addEventListener(event, (e) => {
    const value = parseFloat(e.target.value);
    const currentAnnotation = instance.getSelectedAnnotation();
    let updatedAnnotation = currentAnnotation.set(prop, value);

    if (label) {
      label.innerText = value;
    }

    if (
      prop === "strokeWidth" &&
      updatedAnnotation.cloudyBorderIntensity > 0 &&
      updatedAnnotation.cloudyBorderInset
    ) {
      updatedAnnotation = updatedAnnotation.set(
        "cloudyBorderInset",
        new PSPDFKit.Geometry.Inset({
          left:
            updatedAnnotation.cloudyBorderInset.left +
            (value - currentAnnotation.strokeWidth) / 2,
          top:
            updatedAnnotation.cloudyBorderInset.top +
            (value - currentAnnotation.strokeWidth) / 2,
          right:
            updatedAnnotation.cloudyBorderInset.right +
            (value - currentAnnotation.strokeWidth) / 2,
          bottom:
            updatedAnnotation.cloudyBorderInset.bottom +
            (value - currentAnnotation.strokeWidth) / 2,
        })
      );
    }

    instance.update(updatedAnnotation);
  });

  return label ? [input, label] : [input];
}

// Generator of select elements given an array of options.
// For simple cases you can just specify string values on the array.
// Otherwise add { label, value } objects as entries.
function createSelectField(prop, options = []) {
  const select = document.createElement("select");

  select.className = "annotation-select";

  const currentVal = instance.getSelectedAnnotation()[prop];
  const optionsHTML = options
    .map((option, i) => {
      const optionValue = option.value || option;
      const areValuesEqual = Array.isArray(optionValue)
        ? JSON.stringify(optionValue) === JSON.stringify(currentVal)
        : currentVal === optionValue;

      return `<option value=${i} ${areValuesEqual ? "selected" : ""}>${
        option.label || option
      }</option>`;
    })
    .join("");

  select.innerHTML = optionsHTML;
  select.addEventListener("change", (e) => {
    const updatedAnnotation = instance
      .getSelectedAnnotation()
      .set(
        prop,
        options[parseInt(e.target.value)].value === undefined
          ? options[parseInt(e.target.value)]
          : options[parseInt(e.target.value)].value
      );

    instance.update(updatedAnnotation);
  });

  return [select];
}

// Group of buttons to handle radio buttons or checkboxes interactions.
// In the case of checkbox-alike interactions, one should specif an array of
// boolean properties that matches each of the possible options to display.
// One example of this is the "Text style" row when inspecting text
// annotations.
function toggleFields(prop, { type = "radio", options = [] }) {
  const form = document.createElement("form");

  form.className = "switch-form";

  let currentVal;

  if (type === "radio") {
    currentVal = instance.getSelectedAnnotation()[prop];
  }

  options.forEach((option, i) => {
    const input = document.createElement("input");

    input.type = type;
    input.id = `${type}-${prop}-${option.label || ""}`;
    input.name = prop;

    if (type === "radio") {
      input.value = option.value;
    }

    if (Array.isArray(prop)) {
      // For the checkboxes implementation, one can specify
      // an array with properties to bind to each of the inputs.
      input.checked = !!instance.getSelectedAnnotation()[prop[i]];
    } else {
      if (option.value === currentVal) {
        input.checked = true;
      }
    }

    const label = document.createElement("label");

    label.htmlFor = input.id;
    label.setAttribute("role", "button");

    const icon = document.createElement("img");

    icon.setAttribute("src", option.icon);
    icon.setAttribute("alt", option.label);
    label.appendChild(icon);

    if (type === "checkbox") {
      // In this case we can attach a change event listener
      // for each checkbox.
      input.addEventListener("change", (e) => {
        let updatedAnnotation;

        if (Array.isArray(prop)) {
          updatedAnnotation = instance
            .getSelectedAnnotation()
            .set(prop[i], e.target.checked);
        } else {
          updatedAnnotation = instance
            .getSelectedAnnotation()
            .set(prop, e.target.checked);
        }

        instance.update(updatedAnnotation);
      });
    }

    form.appendChild(input);
    form.appendChild(label);
  });

  if (type === "radio") {
    // For the radio buttons implementation, we attach the
    // change event handler to the form, to easily identify
    // the active radio button.
    form.addEventListener("change", () => {
      const selectedRadio = form.querySelector("input:checked");
      const updatedAnnotation = instance
        .getSelectedAnnotation()
        .set(prop, selectedRadio.value);

      instance.update(updatedAnnotation);
    });
  }

  return [form];
}

// Helper functions to convert between RGB and Hex values.
function rgbToHex(rgb) {
  const csv = rgb.split("(")[1].split(")")[0];
  const split = csv.split(",");
  const [r, g, b] = [split[0].trim(), split[1].trim(), split[2].trim()];

  return `#${rgbPartToHex(r)}${rgbPartToHex(g)}${rgbPartToHex(b)}`;
}

function hexToRgb(hex) {
  const numberPart = hex.split("#")[1];
  const number = parseInt(numberPart, 16);

  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255,
  };
}

function rgbPartToHex(part) {
  const number = Number.parseInt(part, 10);
  const hex = number.toString(16);

  return hex.length == 1 ? "0" + hex : hex;
}

// Basic implementation of a throttle function.
function throttled(delay, fn) {
  let lastCall = 0;

  return (...args) => {
    const now = Date.now();

    if (now - lastCall < delay) {
      return;
    }

    lastCall = now;

    return fn(...args);
  };
}
