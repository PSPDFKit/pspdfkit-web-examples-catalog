export function flattenAnnotationsHandler({ editorHandler }) {
  const selectedIndexes = editorHandler.getSelectedPageIndexes();

  editorHandler.setOperations(
    (operations) =>
      operations.concat([
        {
          type: "flattenAnnotations",
          ...(selectedIndexes.length > 0
            ? { pageIndexes: selectedIndexes }
            : null),
        },
      ]),
    true
  );
}
