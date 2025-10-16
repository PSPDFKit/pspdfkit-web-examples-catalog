import PSPDFKit from "@nutrient-sdk/viewer";
import React from "react";

let isInstant = true;

const mentionableUsers = [
  {
    name: "Karen Anderson",
    displayName: "kanderson",
    id: "kanderson_123",
    description: "karen.anderson@gmail.com",
  },
  {
    name: "Mark Jones",
    displayName: "mjones",
    id: "mjones_456",
    description: "mark.jones@gmail.com",
  },
  {
    name: "Rachel Garcia",
    displayName: "rgarcia",
    id: "rgarcia_789",
    description: "rachel.garcia@gmail.com",
  },
  {
    name: "John Smith",
    displayName: "jsmith",
    id: "jsmith_012",
    description: "john.smith@gmail.com",
  },
  {
    name: "Emily Davis",
    displayName: "edavis",
    id: "edavis_345",
    description: "emily.davis@gmail.com",
  },
  {
    name: "Ryan Taylor",
    displayName: "",
    id: "rtaylor_678",
    description: "ryan.taylor@gmail.com",
  },
  {
    name: "Sarah Brown",
    displayName: "sbrown",
    id: "sbrown_901",
    description: "sarah.brown@gmail.com",
  },
  {
    name: "Michael Lee",
    displayName: "mlee",
    id: "mlee_234",
    description: "michael.lee@gmail.com",
  },
  {
    name: "Jennifer Wilson",
    displayName: "jwilson",
    id: "jwilson_567",
    description: "jwilson@gmail.com",
  },
  {
    name: "David Martinez",
    displayName: "dmartinez",
    id: "dmartinez_890",
    description: "david.martinez@gmail.com",
  },
];

export function load(defaultConfiguration) {
  if (!defaultConfiguration.instant && !defaultConfiguration.document) {
    console.log(
      "Instant Comments are not supported in Nutrient Document Engine without Instant.",
    );
    isInstant = false;

    return null;
  }

  isInstant = true;

  const toolbarItems = PSPDFKit.defaultToolbarItems;

  // Enable the comments tool in the main toolbar.
  // We are placing it as the first tool on the right hand side of the toolbar.
  toolbarItems.splice(
    toolbarItems.findIndex((item) => item.type === "spacer") + 1,
    0,
    { type: "comment" },
  );

  PSPDFKit.unload(defaultConfiguration.container);

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems,
    mentionableUsers,
    initialViewState: new PSPDFKit.ViewState({
      sidebarOptions: {
        [PSPDFKit.SidebarMode.ANNOTATIONS]: {
          includeContent: [PSPDFKit.Comment],
        },
      },
    }),
  }).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    const userAvatarTemplates = {};
    const commentAvatars = {};

    const creator =
      window.jwtParameters && window.jwtParameters.user_id
        ? window.jwtParameters.user_id
        : defaultCreatorName();

    instance.addEventListener("comments.mention", (event) => {
      console.log("comments.mention", event);
    });

    instance.setAnnotationCreatorName(creator);

    instance.setIsEditableComment(
      (comment) =>
        (creator && creator.toLowerCase() === "admin") ||
        comment.creatorName === creator ||
        comment.pageIndex === null, // always allow the user to add new comments
    );

    instance.setIsEditableAnnotation(
      (annotation) =>
        !(annotation instanceof PSPDFKit.Annotations.CommentMarkerAnnotation) ||
        annotation.creatorName === creator,
    );

    instance.setCustomRenderers({
      CommentAvatar: ({ comment }) => {
        let commentAvatar = commentAvatars[comment.id];

        // Cache avatars so that they are not recreated on every update.
        if (!commentAvatar) {
          let userAvatarTemplate = userAvatarTemplates[comment.creatorName];

          // This is a template avatar image for a specific creatorName.
          // In a real world application you might want to cache by a userId.
          if (!userAvatarTemplate) {
            userAvatarTemplate = document.createElement("img");
            userAvatarTemplate.src = "/static/avatar.png";
            userAvatarTemplates[comment.creatorName] = userAvatarTemplate;
          }

          userAvatarTemplate.style.width = "32px";
          userAvatarTemplate.style.borderRadius = "50%";

          // Every comment needs its own image element even though the image
          // belongs to the same user - that's why we clone the template.
          commentAvatar = userAvatarTemplate.cloneNode();
          commentAvatars[comment.id] = commentAvatar;
        }

        return {
          node: commentAvatar,
          append: false,
        };
      },
    });

    return instance;
  });
}

/**
 * This section is not relevant for the demo. This is just a UI implementation of message that we show
 * if the user is running the standalone setup in our catalog examples to tell the user that
 * we don't support this feature in standalone mode. You can ignore this.
 */
export const CustomContainer = React.forwardRef((props, ref) => {
  React.useEffect(() => {
    if (!isInstant) return;

    const creator = window.prompt(
      "Choose a user name for commenting. By setting the username to 'Admin' you can edit all the comments.",
    );

    const finalCreatorName = creator || defaultCreatorName();

    window.jwtParameters = { user_id: finalCreatorName };

    // Re-render the document with the updated user ID.
    props.onForceReRender();
  }, [props.onForceReRender]);

  return <div className="container" ref={ref} style={{ height: "100%" }} />;
});

function defaultCreatorName() {
  `Anonymous_${parseInt(Math.random() * 10000)}`;
}
