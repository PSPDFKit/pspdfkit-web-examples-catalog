import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  return PSPDFKit.load(defaultConfiguration).then(instance => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    // Every time a user clicks on the page, we show a custom overlay item on
    // this page.
    instance.addEventListener("page.press", event => {
      if (event.pageIndex === 0) {
        instance.setCustomOverlayItem(getOverlayItemForPage1());
      }
      if (event.pageIndex === 1) {
        instance.setCustomOverlayItem(getOverlayItemForPage2());
      }
    });
    return instance;
  });
}

function getOverlayItemForPage1() {
  // We create a div element with an emoji and a short text.
  const overlayElement = document.createElement("div");
  overlayElement.style.cssText =
    "width: 300px;background: #FFF; border: 1px #333 solid; font-family: sans-serif; font-size: 14px; padding: 20px;";
  overlayElement.innerHTML =
    "<p>👋 This is an overlay item that appears when clicking on the first page. Find out what happens when you click on the second page.";

  // Then we return a PSPDFKit.CustomOverlayItem which uses the overlayElement
  // that we created above as a node, the pageIndex we get from our onPress
  // event and define the position on the page.
  return new PSPDFKit.CustomOverlayItem({
    id: "overlay-item-first-page",
    node: overlayElement,
    pageIndex: 0,
    position: new PSPDFKit.Geometry.Point({ x: 300, y: 50 })
  });
}

function getOverlayItemForPage2() {
  const overlayElement = document.createElement("div");
  // In this case we embedd a video to the page
  overlayElement.innerHTML = `<iframe src="https://player.vimeo.com/video/227250697" width="500" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>`;

  // Then we return a PSPDFKit.CustomOverlayItem which uses the overlayElement
  // that we created above as a node, the pageIndex we get from our onPress
  // event and define the position on the page.
  return new PSPDFKit.CustomOverlayItem({
    id: "overlay-item-second-page",
    node: overlayElement,
    pageIndex: 1,
    position: new PSPDFKit.Geometry.Point({ x: 55, y: 220 })
  });
}
