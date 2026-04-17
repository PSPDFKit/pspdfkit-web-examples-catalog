import PSPDFKit from "@nutrient-sdk/viewer";
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";

const CommentThread = (props) => {
  const { instance, id } = props;
  const [comments, setComments] = React.useState(null);
  // We only allow editing one comment at a time
  const [editCommentId, setEditCommentId] = React.useState(null);

  useEffect(() => {
    const syncComments = () => {
      instance?.getComments().then((initialComments) => {
        const commentsInThread = initialComments.filter((c) => c.rootId === id);
        setComments(commentsInThread);
      });
    };

    syncComments();

    instance?.addEventListener("comments.change", syncComments);

    return () => {
      instance?.removeEventListener("comments.change", syncComments);
    };
  }, [instance, id, setComments]);

  return (
    <div className="comment-thread-container">
      <p className="total-comments">💬 Total comments: {comments?.size ?? 0}</p>
      {comments?.map((comment) => (
        <div key={comment.id} className="comment-container">
          <div className="comment-creator">
            🧑 Author: {comment.creatorName ?? "Anonymous"}
          </div>
          <div className="comment-date">
            📅 Date: {comment.createdAt?.toLocaleString()}
          </div>
          {editCommentId === comment.id ? (
            <input
              className="comment-input"
              placeholder="Enter your comment"
              autoFocus
              aria-label="Comment editor"
              defaultValue={comment.text.value}
              onKeyDown={(e) => {
                if (e.key !== "Enter") {
                  return;
                }

                const value = e.currentTarget.value;
                const updatedComment = comment.set("text", {
                  format: "plain",
                  value,
                });

                instance?.update(updatedComment).then(() => {
                  setEditCommentId(null);
                });
              }}
            />
          ) : (
            <>
              <div className="comment-content">{comment.text.value}</div>
              <button
                className="comment-button"
                label="Edit"
                onClick={() => setEditCommentId(comment.id)}
              >
                Edit
              </button>
            </>
          )}

          <button
            className="comment-button"
            onClick={() => instance?.delete(comment)}
          >
            Delete
          </button>
        </div>
      ))}
      <input
        className="comment-input"
        placeholder="Add a comment"
        autoFocus
        onKeyDown={async (e) => {
          if (!instance) {
            return;
          }

          if (e.key !== "Enter") {
            return;
          }

          const value = e.currentTarget.value;

          const commentsInThread = (await instance.getComments()).filter(
            (c) => c.rootId === id,
          );

          const isFirstComment = commentsInThread.size === 0;

          if (isFirstComment) {
            // In case of first comment, the SDK already creates a draft comment along with CommentMarkerAnnotation.
            // So we need to update that draft comment instead of creating a new one.
            const draftCommentInThread = (
              await instance.getComments({ includeDrafts: true })
            )
              .filter((c) => c.rootId === id && c.pageIndex === null)
              .first();

            const annotations = await instance.getAnnotations(
              instance.viewState.currentPageIndex,
            );

            // We also need to mark the associated CommentMarkerAnnotation as the root of the comment thread.
            const rootAnnotation = annotations
              .find((a) => a.id === id)
              .set("isCommentThreadRoot", true);

            const newComment = draftCommentInThread
              .set("text", {
                format: "plain",
                value,
              })
              .set("pageIndex", instance.viewState.currentPageIndex);

            await instance.update([newComment, rootAnnotation]);
          } else {
            // For subsequent comments, we can create new comments without relying on draft comments.
            const newComment = new PSPDFKit.Comment({
              rootId: id,
              text: {
                format: "plain",
                value,
              },
              pageIndex: instance.viewState.currentPageIndex,
            });

            await instance.create(newComment);
          }

          // Reset the input field to accept new comments.
          e.target.value = "";
        }}
      />
    </div>
  );
};

const ui = {
  commentThread: (instance, id) => {
    const container = document.createElement("div");
    // Mount a React app on the container to manage the DOM
    const root = createRoot(container);

    return {
      render: () => container,
      onMount: () => {
        root.render(<CommentThread id={id} instance={instance} />);
      },
      onUnmount: () => {
        root.unmount();
      },
    };
  },
};

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    styleSheets: ["/ui-customization-comments/static/styles.css"],
    ui,
  }).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    return instance;
  });
}
