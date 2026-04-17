import { rotateIcon } from "./icons";

let instance;

export function load(defaultConfig) {
  const select = document.createElement("select");

  const options = [
    { value: "0", label: "0°" },
    { value: "90", label: "90°" },
    { value: "180", label: "180°" },
    { value: "270", label: "270°" },
  ];

  options.forEach((option) => {
    const optionElement = document.createElement("option");

    optionElement.value = option.value;
    optionElement.innerHTML = option.label;
    select.appendChild(optionElement);
  });
  select.onchange = (e) => {
    rotateInkAnnotation(parseInt(e.target.value, 10));

    instance.contentDocument.querySelector(".PSPDFKit-Rotation select").value =
      e.target.value;
  };
  const useDarkTheme =
    defaultConfig.theme === PSPDFKit.Theme.DARK ||
    (defaultConfig.theme !== PSPDFKit.Theme.LIGHT &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  PSPDFKit.load({
    ...defaultConfig,
    annotationToolbarItems: (
      annotation,
      { hasDesktopLayout, defaultAnnotationToolbarItems }
    ) => {
      if (!(annotation instanceof PSPDFKit.Annotations.InkAnnotation))
        return defaultAnnotationToolbarItems;

      const id = document.createElement("div");

      const themeColorOpenSpan = `<span style="color: ${
        useDarkTheme ? "white" : "black"
      }">`;

      id.innerHTML = `${themeColorOpenSpan}<b>ID:</b> ${annotation.id}</span>`;

      const rotation = document.createElement("div");

      rotation.classList.add("PSPDFKit-Rotation");

      rotation.innerHTML = `${themeColorOpenSpan}${rotateIcon}</span>`;
      rotation.appendChild(select);

      return [
        ...(hasDesktopLayout
          ? [
              {
                id: annotation.id,
                type: "custom",
                node: id,
                className: "annotation-id",
              },
            ]
          : []),
        { type: "annotation-note" },
        {
          type: "delete",
        },
        {
          type: "spacer",
        },
        {
          type: "stroke-color",
        },
        {
          type: "fill-color",
        },
        {
          type: "opacity",
        },
        {
          type: "line-width",
        },
        ...(annotation.pageIndex !== null
          ? [
              {
                id: "rotation",
                type: "custom",
                icon: rotateIcon,
                node: rotation,
              },
            ]
          : []),
      ];
    },
    styleSheets: ["/customized-annotation-toolbar/static/style.css"],
  }).then(async (ins) => {
    const anns = await ins.getAnnotations(0);
    const inkAnnotations = anns.filter(
      (ann) => ann instanceof PSPDFKit.Annotations.InkAnnotation
    );

    ins.setSelectedAnnotation(inkAnnotations.get(0));

    instance = ins;
  });
}

function rotateInkAnnotation(degrees) {
  const annotation = instance.getSelectedAnnotation();

  // Get annotation geometric center
  const annotationCenter = new PSPDFKit.Geometry.Point({
    x: annotation.boundingBox.left + annotation.boundingBox.width / 2,
    y: annotation.boundingBox.top + annotation.boundingBox.height / 2,
  });

  let rotatedAnnotation = annotation.update("lines", (lines) =>
    lines.map((line) =>
      line.map((point) =>
        // Rotate each annotation point
        point
          .translate(annotationCenter.scale(-1))
          .rotate(degrees)
          .translate(annotationCenter)
      )
    )
  );

  // For 90 and 270 degrees, the bounding box needs to be rotated too
  if (degrees === 90 || degrees === 270) {
    rotatedAnnotation = rotatedAnnotation.set(
      "boundingBox",
      new PSPDFKit.Geometry.Rect({
        left: annotationCenter.x - annotation.boundingBox.height / 2,
        top: annotationCenter.y - annotation.boundingBox.width / 2,
        width: annotation.boundingBox.height,
        height: annotation.boundingBox.width,
      })
    );
  }

  instance.update(rotatedAnnotation);
}
