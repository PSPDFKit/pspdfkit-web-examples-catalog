import PSPDFKit from "pspdfkit";

let _instance;
export function load(defaultConfiguration) {
  const initialViewState = new PSPDFKit.ViewState({
    scrollMode: PSPDFKit.ScrollMode.PER_SPREAD,
    layoutMode: PSPDFKit.LayoutMode.SINGLE
  });

  let fullscreenElement = defaultConfiguration.container.parentNode;

  registerFullscreenChangeEvents();

  const toolbarItems = [
    {
      type: "pager"
    },
    {
      type: "spacer"
    },
    {
      type: "sidebar-thumbnails"
    },
    {
      type: "search"
    },
    {
      type: "highlighter"
    }
  ];

  // A custom toolbar item to toggle full screen mode.
  const fullScreenToolbarItem = {
    type: "custom",
    title: "Toggle full screen mode",
    onPress: () => {
      // You can implement the fullscreen mode on your own. Either see our
      // functions below how to activate it or look at our guides:
      // https://pspdfkit.com/guides/web/current/features/fullscreen-mode/
      if (isFullscreenEnabled()) {
        exitFullscreen();
      } else {
        requestFullScreen(fullscreenElement);
      }
    }
  };

  if (isFullScreenSupported()) {
    toolbarItems.push(fullScreenToolbarItem);
  }

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems,
    toolbarPlacement: PSPDFKit.ToolbarPlacement.BOTTOM,
    initialViewState
  }).then(instance => {
    _instance = instance;

    console.log("PSPDFKit for Web successfully loaded!!", instance);
    return instance;
  });
}

export function unload() {
  removeFullscreenChangeEvents();
}

function onFullScreenChange() {
  _instance.setViewState(
    _instance.viewState.set("showToolbar", !isFullscreenEnabled())
  );
}

function registerFullscreenChangeEvents() {
  document.addEventListener("fullscreenchange", onFullScreenChange);
  document.addEventListener("webkitfullscreenchange", onFullScreenChange);
  document.addEventListener("mozfullscreenchange", onFullScreenChange);
  document.addEventListener("MSFullscreenChange", onFullScreenChange);
}

function removeFullscreenChangeEvents() {
  document.removeEventListener("fullscreenchange", onFullScreenChange);
  document.removeEventListener("webkitfullscreenchange", onFullScreenChange);
  document.removeEventListener("mozfullscreenchange", onFullScreenChange);
  document.removeEventListener("MSFullscreenChange", onFullScreenChange);
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
