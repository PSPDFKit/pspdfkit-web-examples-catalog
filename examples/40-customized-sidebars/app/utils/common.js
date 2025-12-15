import * as React from "react";

// Custom React hook that provides a callback that always closes over the latest data
// but keeps the same  identity and will not be called after component unmounts.
// Used to prevent undesired rerenders and useEffect executions.
export function useStableCallback(callback) {
  const callbackRef = React.useRef();

  const memoCallback = React.useCallback(
    (...args) => callbackRef.current && callbackRef.current(...args),
    []
  );

  React.useEffect(() => {
    callbackRef.current = callback;

    return () => (callbackRef.current = undefined);
  });

  return memoCallback;
}

// Update toolbar sidebar button selected state
export function setSelectedButtonsState(viewState) {
  const instance = viewState.instance;

  instance &&
    instance.setToolbarItems((items) =>
      items.map((item) => {
        if (item.id === "custom-search-results") {
          return {
            ...item,
            selected: viewState.sidebarMode === PSPDFKit.SidebarMode.CUSTOM,
          };
        } else if (item.id === "custom-annotations-filter") {
          return {
            ...item,
            selected:
              viewState.sidebarMode === PSPDFKit.SidebarMode.ANNOTATIONS,
          };
        }

        return item;
      })
    );
}

// Get icon img component async
export function useIcon(url) {
  const [icon, setIcon] = React.useState(null);
  const isMounted = useIsMounted();

  React.useEffect(() => {
    const img = new Image();

    img.onload = () => isMounted() && setIcon(<img src={url} />);
    img.src = url;
  }, [url, isMounted]);

  return icon;
}

// Get mounted state predicate callback
export function useIsMounted() {
  const isMountedRef = React.useRef(true);
  const isMounted = React.useCallback(() => isMountedRef.current, []);

  React.useEffect(() => () => void (isMountedRef.current = false), []);

  return isMounted;
}

// Closest ponyfill
export function closest(target, selector) {
  if (typeof target.closest === "function") {
    return target.closest(selector);
  } else {
    while (target) {
      if (target.matches(selector)) {
        return target;
      }

      target = target.parentElement;
    }
  }
}
