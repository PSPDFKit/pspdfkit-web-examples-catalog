import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  // Keep track of the current instance
  // so that we can use it inside of a toolbar item onPress callback.
  let instance = null;

  // PSPDFKit exposes the default list of items as PSPDFKit.defaultToolbarItems
  // This is an Array that can be filtered or customized as you please.
  const toolbarItems = PSPDFKit.defaultToolbarItems.filter((item) => {
    return /\b(sidebar-bookmarks|sidebar-thumbnails|zoom-in|zoom-out)\b/.test(
      item.type
    );
  });

  toolbarItems.push({
    type: "spacer",
  });

  // A custom item. Inside the onPress callback we can call into PSPDFKit APIs.
  toolbarItems.push({
    type: "custom",
    id: "my-custom-button",
    title: "click me",
    onPress: function () {
      alert(
        "Hello from PSPDFKit " +
          PSPDFKit.version +
          "\nYou are at page " +
          instance.viewState.currentPageIndex
      );
    },
  });

  toolbarItems.push({
    type: "search",
  });

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: toolbarItems,
  }).then((newInstance) => {
    instance = newInstance;
  });
}
