import PSPDFKit from "@nutrient-sdk/viewer";

import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

export function load(defaultConfiguration) {
  // Nutrient Web SDK freezes the Options object to prevent changes after the first load
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  const toolbarItems = PSPDFKit.defaultToolbarItems;

  // Enable the comments tool in the main toolbar.
  // We are placing it as the first tool on the right hand side of the toolbar.
  toolbarItems.splice(
    toolbarItems.findIndex((item) => item.type === "spacer") + 1,
    0,
    { type: "comment" }
  );

  return PSPDFKit.load({
    ...defaultConfiguration,
    enableHistory: true,
    instantJSON: {
      annotations: [
        {
          bbox: [162.68124389648438, 145.29376220703125, 32, 32],
          createdAt: "2024-04-11T07:23:26Z",
          creatorName: "",
          id: "01HV60ME365HS69FVQ1CE6PK2G",
          isCommentThreadRoot: true,
          name: "01HV60ME365HS69FVQ1CE6PK2G",
          opacity: 1,
          pageIndex: 0,
          type: "pspdfkit/comment-marker",
          updatedAt: "2024-04-11T07:23:37Z",
          v: 2,
        },
      ],
      comments: [
        {
          createdAt: "2024-04-11T07:23:26Z",
          creatorName: "",
          id: "01HV60MEZC5Q4VC76NSKFDPYK9",
          name: "01HV60ME365HS69FVQ1CE6PK2G",
          pageIndex: 0,
          pdfObjectId: 218,
          rootId: "01HV60ME365HS69FVQ1CE6PK2G",
          text: {
            format: "xhtml",
            value: "<p>First comment created with instantJSON</p>",
          },
          type: "pspdfkit/comment",
          updatedAt: "2024-04-11T07:23:37Z",
          v: 2,
        },
        {
          createdAt: "2024-04-11T07:23:37Z",
          creatorName: "",
          id: "01HV60MSMD6HTZPWCAHEQCS17F",
          pageIndex: 0,
          pdfObjectId: 218,
          rootId: "01HV60ME365HS69FVQ1CE6PK2G",
          text: {
            format: "xhtml",
            value: "<p>Reply to the first comment created with instantJSON</p>",
          },
          type: "pspdfkit/comment",
          updatedAt: "2024-04-11T07:23:46Z",
          v: 2,
        },
      ],
      format: "https://pspdfkit.com/instant-json/v1",
    },
    toolbarItems,
    styleSheets: [`${location.pathname}/static/styles.css`],
  }).then(async (instance) => {
    const commentAnnotation = new PSPDFKit.Annotations.CommentMarkerAnnotation({
        id: PSPDFKit.generateInstantId(),
        pageIndex: 0,
        boundingBox: new PSPDFKit.Geometry.Rect({
          left: 250,
          top: 250,
          width: 200,
          height: 200,
        }),
      }),
      commentRoot = new PSPDFKit.Comment({
        rootId: commentAnnotation.id,
        pageIndex: 0,
        text: {
          format: "plain",
          value: "Programatically created comment with instance.create",
        },
      }),
      commentReply = new PSPDFKit.Comment({
        rootId: commentAnnotation.id,
        pageIndex: 0,
        text: {
          format: "plain",
          value:
            "Reply to programatically created comment with instance.create",
        },
      });

    await instance.create([commentAnnotation, commentRoot, commentReply]);

    dialog(
      instance,
      "Load annotations with comments using the instantJSON property during the initial .load process. After the instance is created, an additional annotation with comments is programmatically added."
    );

    return instance;
  });
}

export function dialog(instance, text) {
  const p = document.createElement("p");
  p.textContent = text;
  const button = document.createElement("button");
  button.textContent = "OK";
  button.addEventListener("click", () => {
    instance.removeCustomOverlayItem("dialog");
  });
  const dialogContent = document.createElement("div");
  dialogContent.appendChild(p);
  dialogContent.appendChild(button);
  dialogContent.classList.add("dialog");
  const { width, height } = instance.pageInfoForIndex(0);
  dialogContent.style.width = `${width / 2}px`;
  instance.setCustomOverlayItem(
    new PSPDFKit.CustomOverlayItem({
      id: "dialog",
      node: dialogContent,
      pageIndex: 0,
      position: new PSPDFKit.Geometry.Point({ x: width / 2, y: height / 4 }),
    })
  );
}
