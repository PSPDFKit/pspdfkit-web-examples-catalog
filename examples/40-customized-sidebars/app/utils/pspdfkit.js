import PSPDFKit from "pspdfkit";
import React from "react";

const hiddenSidebars = [
  "sidebar-bookmarks",
  "sidebar-document-outline",
  "sidebar-thumbnails",
  "sidebar-annotations",
];

export function getAppToolbarItems(
  configuration,
  getInstance,
  setCustomSidebarId
) {
  return configuration.toolbarItems.reduce((acc, item) => {
    // Add custom sidebar button after bookmarks button
    if (item.type === "sidebar-bookmarks") {
      // Include a button to show the custom sidebar.
      return acc.concat([
        {
          type: "custom",
          icon: annotationsFilterIcon,
          title: "Annotations filter",
          id: "custom-annotations-filter",
          className: "customSidebarButton",
          onPress() {
            // Toggle sidebar
            getInstance().setViewState((viewState) =>
              viewState.set(
                "sidebarMode",
                viewState.sidebarMode !== PSPDFKit.SidebarMode.ANNOTATIONS
                  ? PSPDFKit.SidebarMode.ANNOTATIONS
                  : null
              )
            );
          },
          dropdownGroup: "sidebar",
        },
        {
          type: "custom",
          icon: searchResultsIcon,
          title: "Search results",
          id: "custom-search-results",
          className: "customSidebarButton",
          onPress() {
            // Toggle sidebar
            getInstance().setViewState((viewState) =>
              viewState.set(
                "sidebarMode",
                viewState.sidebarMode !== PSPDFKit.SidebarMode.CUSTOM
                  ? PSPDFKit.SidebarMode.CUSTOM
                  : null
              )
            );
            setCustomSidebarId("custom-search-results");
          },
          dropdownGroup: "sidebar",
        },
        {
          type: "sidebar-thumbnails",
        },
        {
          type: "custom",
          icon: simpleSidebarIcon,
          title: "Custom simple sidebar",
          id: "custom-simple",
          className: "customSidebarButton",
          onPress() {
            // Toggle sidebar
            getInstance().setViewState((viewState) =>
              viewState.set(
                "sidebarMode",
                viewState.sidebarMode !== PSPDFKit.SidebarMode.CUSTOM
                  ? PSPDFKit.SidebarMode.CUSTOM
                  : null
              )
            );
            setCustomSidebarId("custom-simple");
          },
          dropdownGroup: "sidebar",
        },
      ]);
    } else if (hiddenSidebars.includes(item.type)) {
      return acc;
    }

    return acc.concat([item]);
  }, []);
}

export function usePSPDFKitInstance(
  PSPDFKitConfiguration,
  PSPDFKitLoaded,
  customUI,
  setCustomSidebarId
) {
  const [instance, setInstance] = React.useState(null);

  const isLoadingRef = React.useRef(false);

  // Load PSPDFKit
  React.useEffect(() => {
    async function loadPSPDFKit() {
      const instance = await PSPDFKit.load({
        ...PSPDFKitConfiguration,
        toolbarItems: getAppToolbarItems(
          PSPDFKitConfiguration,
          () => instance,
          setCustomSidebarId
        ),
        customUI,
        styleSheets: ["/customized-sidebars/static/style.css"],
      });

      console.log("PSPDFKit for Web successfully loaded!!", instance);

      setInstance(instance);
      isLoadingRef.current = false;
      PSPDFKitLoaded(instance);
    }

    // Ensure we only load PSPDFKit once
    if (!instance && !isLoadingRef.current) {
      isLoadingRef.current = true;

      loadPSPDFKit();
    }
  }, [PSPDFKitConfiguration, PSPDFKitLoaded, instance, customUI]);

  return instance;
}

const searchResultsIcon =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.33"><path d="M2.5 18.5H11.5" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round"/><path d="M9.5 16.5H7.5" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round"/><path d="M8.5 14.5H2.5" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round"/><path d="M2.5 12.5H4.5" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round"/><path d="M7.50003 10.5H9.00003" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round"/><path d="M10.5 8.5H2.5" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round"/><path d="M12.5 6.5L7.5 6.5" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round"/><path d="M10.5 4.5H12.5" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round"/><path d="M2.5 4.5H3.5" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round"/></g><rect width="4" height="1" transform="matrix(-1 0 0 1 6 16)" fill="currentColor"/><path d="M6 12H8.5V13H6V12Z" fill="currentColor"/><rect x="2" y="10" width="4" height="1" fill="currentColor"/><rect width="4" height="1" transform="matrix(-1 0 0 1 6 6)" fill="currentColor"/><rect x="5" y="4" width="4" height="1" fill="currentColor"/><path opacity="0.66" d="M19.6559 16.5841L23.1914 20.1196C23.3867 20.3149 23.3867 20.6314 23.1914 20.8267L22.8379 21.1803C22.6426 21.3755 22.326 21.3755 22.1308 21.1803L18.5952 17.6447L19.6559 16.5841Z" fill="currentColor"/><circle cx="15.0112" cy="13" r="4.5" stroke="currentColor"/></svg>';

const annotationsFilterIcon =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.35317 21.8701C9.14203 21.6589 9.08969 21.3364 9.22322 21.0693L10.4138 18.6881L12.5352 20.8094L10.1539 22C9.88687 22.1336 9.56431 22.0812 9.35317 21.8701Z" fill="currentColor"/><path opacity="0.25" d="M12.5352 15.8597L17.4849 10.9099L20.3133 13.7384L15.3636 18.6881L12.5352 15.8597Z" fill="currentColor"/><path d="M12.5351 20.8094L12.1816 21.163L12.5351 21.5165L12.8887 21.163L12.5351 20.8094ZM10.4138 18.6881L10.0603 18.3345L9.70672 18.6881L10.0603 19.0416L10.4138 18.6881ZM11.5118 17.5155L11.9862 17.6736L11.5118 17.5155ZM13.9846 19.6192L14.1427 20.0935L13.9846 19.6192ZM19.6062 10.2028L21.0204 11.617L21.7275 10.9099L20.3133 9.49571L19.6062 10.2028ZM13.8265 19.1448L13.5497 19.2371L13.8659 20.1858L14.1427 20.0935L13.8265 19.1448ZM11.9862 17.6736L12.0784 17.3967L11.1297 17.0805L11.0375 17.3573L11.9862 17.6736ZM13.1588 19.4787L12.1816 20.4559L12.8887 21.163L13.8659 20.1858L13.1588 19.4787ZM12.8887 20.4559L10.7674 18.3345L10.0603 19.0416L12.1816 21.163L12.8887 20.4559ZM10.7674 19.0416L11.7446 18.0645L11.0375 17.3573L10.0603 18.3345L10.7674 19.0416ZM21.0204 12.3241L14.8037 18.5409L15.5108 19.248L21.7275 13.0312L21.0204 12.3241ZM12.6824 16.4196L18.8991 10.2028L18.192 9.49571L11.9753 15.7124L12.6824 16.4196ZM11.0375 17.3573L11.0375 17.3573L11.7446 18.0645C11.8544 17.9547 11.9371 17.8208 11.9862 17.6736L11.0375 17.3573ZM13.5497 19.2371C13.4024 19.2862 13.2686 19.3689 13.1588 19.4787L13.8659 20.1858L13.5497 19.2371ZM14.1427 20.0935C14.6582 19.9217 15.1266 19.6322 15.5108 19.248L14.8037 18.5409C14.5293 18.8153 14.1947 19.0221 13.8265 19.1448L14.1427 20.0935ZM12.0784 17.3967C12.2012 17.0286 12.4079 16.694 12.6824 16.4196L11.9753 15.7124C11.591 16.0967 11.3016 16.565 11.1297 17.0805L12.0784 17.3967ZM21.0204 11.617C21.2157 11.8123 21.2157 12.1289 21.0204 12.3241L21.7275 13.0312C22.3133 12.4455 22.3133 11.4957 21.7275 10.9099L21.0204 11.617ZM20.3133 9.49571C19.7275 8.90992 18.7778 8.90992 18.192 9.49571L18.8991 10.2028C19.0944 10.0076 19.411 10.0076 19.6062 10.2028L20.3133 9.49571Z" fill="currentColor"/><path d="M15.5 2.5H2.5V3.75C2.5 4.16421 2.83579 4.5 3.25 4.5H3.5L7.5 9V12.4594C7.5 12.7823 7.70657 13.0689 8.01283 13.1709L9.51283 13.6709C9.99848 13.8328 10.5 13.4713 10.5 12.9594V9L14.5 4.5H14.75C15.1642 4.5 15.5 4.16421 15.5 3.75V2.5Z" stroke="currentColor"/><path opacity="0.33" d="M14 5L4 5L3 4L15 4L14 5Z" fill="currentColor"/></svg>';

const simpleSidebarIcon =
  '<svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity=".4" fill="currentColor"><mask id="a"><path d="M22 11h-1v2h1v-2Z"/></mask><path d="M22 11h-1v2h1v-2Z"/><path d="M21 11v-1h-1v1h1Zm1 0h1v-1h-1v1Zm0 2v1h1v-1h-1Zm-1 0h-1v1h1v-1Zm0-1h1v-2h-1v2Zm0-1v2h2v-2h-2Zm1 1h-1v2h1v-2Zm0 1v-2h-2v2h2Z" mask="url(#a)"/></g><g opacity=".4" fill="currentColor"><mask id="b"><path d="M22 15h-1v2h1v-2Z"/></mask><path d="M22 15h-1v2h1v-2Z"/><path d="M21 15v-1h-1v1h1Zm1 0h1v-1h-1v1Zm0 2v1h1v-1h-1Zm-1 0h-1v1h1v-1Zm0-1h1v-2h-1v2Zm0-1v2h2v-2h-2Zm1 1h-1v2h1v-2Zm0 1v-2h-2v2h2Z" mask="url(#b)"/></g><g opacity=".4" fill="currentColor"><mask id="c"><path d="M3 11H2v2h1v-2Z"/></mask><path d="M3 11H2v2h1v-2Z"/><path d="M2 11v-1H1v1h1Zm1 0h1v-1H3v1Zm0 2v1h1v-1H3Zm-1 0H1v1h1v-1Zm0-1h1v-2H2v2Zm0-1v2h2v-2H2Zm1 1H2v2h1v-2Zm0 1v-2H1v2h2Z" mask="url(#c)"/></g><g opacity=".4" fill="currentColor"><mask id="d"><path d="M22 7h-1v2h1V7Z"/></mask><path d="M22 7h-1v2h1V7Z"/><path d="M21 7V6h-1v1h1Zm1 0h1V6h-1v1Zm0 2v1h1V9h-1Zm-1 0h-1v1h1V9Zm0-1h1V6h-1v2Zm0-1v2h2V7h-2Zm1 1h-1v2h1V8Zm0 1V7h-2v2h2Z" mask="url(#d)"/></g><path opacity=".4" d="M3 7H2v2h1V7ZM3 15H2v2h1v-2ZM17 21h-2v1h2v-1ZM13 21h-2v1h2v-1ZM9 21H7v1h2v-1ZM17 2h-2v1h2V2ZM13 2h-2v1h2V2ZM9 2H7v1h2V2Z" fill="currentColor"/><path opacity=".4" d="M21.5 19v1a1.5 1.5 0 0 1-1.5 1.5h-1M19 2.5h1A1.5 1.5 0 0 1 21.5 4v1M2.5 5V4A1.5 1.5 0 0 1 4 2.5h1M5 21.5H4A1.5 1.5 0 0 1 2.5 20v-1" stroke="currentColor" stroke-miterlimit="10"/></svg>';
