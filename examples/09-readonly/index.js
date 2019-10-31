import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  // Set the `readOnly` flag in the `initivalViewState` to true to disable
  // creating, editing or deleting annotations.
  // https://pspdfkit.com/api/web/PSPDFKit.ViewState.html#readOnly
  const initialViewState = new PSPDFKit.ViewState({
    readOnly: true
  });

  return PSPDFKit.load({ ...defaultConfiguration, initialViewState }).then(
    instance => {
      return instance;
    }
  );
}
