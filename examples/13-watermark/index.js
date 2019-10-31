import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    // By using the RenderPageCallback https://pspdfkit.com/api/web/PSPDFKit.html#.RenderPageCallback
    // we can define a canvas that we want to render on a page.
    // This can be used to render watermarks, since it overlays the content
    // and also is part of the printed PDF.
    renderPageCallback(ctx, pageIndex, pageSize) {
      // Add a "Confidential" Watermark in the page
      ctx.translate(pageSize.width / 2 - 325, pageSize.height / 2 + 250);
      ctx.rotate(-0.25 * Math.PI);

      ctx.font = "90px Arial";
      ctx.fillStyle = "rgba(76, 130, 212,.2)";
      ctx.fillText("CONFIDENTIAL", 100, 50);
    }
  }).then(instance => {
    return instance;
  });
}
