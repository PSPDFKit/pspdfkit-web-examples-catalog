import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  // Disable continuous scroll and default to double page mode.
  const initialViewState = new PSPDFKit.ViewState({
    scrollMode: PSPDFKit.ScrollMode.PER_SPREAD,
    layoutMode: PSPDFKit.LayoutMode.DOUBLE,
    keepFirstSpreadAsSinglePage: true
  });

  // A custom toolbar item to toggle full screen mode.
  const fullScreenToolbarItem = {
    type: "custom",
    title: "Toggle full screen mode",
    onPress: () => {
      // We use the parent container of our mount node. This is necessary for
      // the iOS specific fixes applied in the iOSFullscreenFix() function.
      const container = defaultConfiguration.container.parentNode;

      // You can implement the fullscreen mode on your own. Either see our
      // functions below how to activate it or look at our guides:
      // https://pspdfkit.com/guides/web/current/features/fullscreen-mode/
      if (isFullscreenEnabled()) {
        exitFullscreen();
      } else {
        requestFullScreen(container);
      }
    }
  };

  // Customize the toolbar.
  let toolbarItems = [
    { type: "sidebar-bookmarks", dropdownGroup: null },
    { type: "sidebar-thumbnails", dropdownGroup: null },
    { type: "highlighter" },
    { type: "zoom-in" },
    { type: "zoom-out" },
    { type: "spacer" },
    { type: "search" }
  ];

  // Only add the fullscreenToolbarItem if the browser supports fullscreen mode
  if (isFullScreenSupported()) {
    toolbarItems.push(fullScreenToolbarItem);
  }

  return PSPDFKit.load({
    ...defaultConfiguration,
    initialViewState,
    toolbarItems
  }).then(instance => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);
    return instance;
  });
}

function isFullscreenEnabled() {
  return (
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

function isFullScreenSupported() {
  return (
    document.fullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullScreenEnabled ||
    document.webkitFullscreenEnabled
  );
}

function requestFullScreen(element) {
  iOSFullscreenFix(element);

  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

// On iOS we have to make some tweaks to the element since the platform will
// overlay specific controls.
//
// We add padding top so that the element is pushed to the bottom and add a
// background color so that the controls become visible.
function iOSFullscreenFix(element) {
  const iOS =
    !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

  if (!iOS) {
    return;
  }

  let firstInvocation = true;
  function cleanup() {
    if (firstInvocation) {
      element.style.paddingTop = "76px";
      element.style.backgroundColor = "black";
      firstInvocation = false;
      return;
    }

    element.style.paddingTop = "0";
    element.style.backgroundColor = "transparent";
    document.removeEventListener("webkitfullscreenchange", cleanup);
  }

  document.addEventListener("webkitfullscreenchange", cleanup);
}
