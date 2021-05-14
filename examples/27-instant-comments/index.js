import PSPDFKit from "pspdfkit";
import React from "react";
import styles from "./static/styles";

let isInstant = true;

export function load(defaultConfiguration) {
  if (!defaultConfiguration.instant || defaultConfiguration.pdf) {
    console.log(
      "Instant Comments are not supported in PSPDFKit for Web Standalone or Server without Instant."
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
    { type: "comment" }
  );

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems,
  }).then((instance) => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    const userAvatarTemplates = {};
    const commentAvatars = {};

    const creator = window.prompt(
      "Choose a user name for commenting. By setting the username to 'Admin' you can edit all the comments."
    );

    const _finalCreatorName =
      creator || `Anonymous_${parseInt(Math.random() * 10000)}`;

    instance.setAnnotationCreatorName(_finalCreatorName);

    instance.setIsEditableComment(
      (comment) =>
        (creator && creator.toLowerCase() === "admin") ||
        comment.creatorName === _finalCreatorName ||
        comment.pageIndex === null // always allow the user to add new comments
    );

    instance.setIsEditableAnnotation(
      (annotation) =>
        !(annotation instanceof PSPDFKit.Annotations.CommentMarkerAnnotation) ||
        annotation.creatorName === _finalCreatorName
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
            userAvatarTemplate = instance.contentDocument.createElement("img");
            userAvatarTemplate.src = "/static/avatar.png";
            userAvatarTemplates[comment.creatorName] = userAvatarTemplate;
          }

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
  if (isInstant) {
    return <div className="container" ref={ref} style={{ height: "100%" }} />;
  }

  return (
    <div ref={ref} className="phases__phase">
      <style jsx>{styles}</style>
      <div className="info">
        <div className="info-content">
          <span className="info-icon">
            <InlineSvgComponent src={require("./static/information.js")} />
          </span>
          <h2>Not available in standalone mode</h2>
          <p>
            Comments require Instant and a server backend to run. It doesn’t
            work in the standalone mode.
          </p>
        </div>
      </div>
    </div>
  );
});

const InlineSvgComponent = ({ src, ...otherProps }) => {
  return <span {...otherProps} dangerouslySetInnerHTML={{ __html: src }} />;
};
