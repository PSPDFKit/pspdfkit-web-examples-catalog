import PSPDFKit from "pspdfkit";
import React from "react";
import ReactDOM from "react-dom";
import { CustomSearchSidebar } from "./sidebars/CustomSearchSidebarComponent";
import { AnnotationsTypeFilter } from "./sidebars/AnnotationsTypeFilterComponent";
import { CustomSimpleSidebar } from "./sidebars/CustomSimpleSidebarComponent";
import { CustomizedThumbnailsSidebarHeader } from "./sidebars/CustomizedThumbnailsSidebarHeaderComponent";
import { useStableCallback, setSelectedButtonsState } from "./utils/common";
import { usePSPDFKitInstance } from "./utils/pspdfkit";

export default function MyApp({ PSPDFKitLoaded, PSPDFKitConfiguration }) {
  const [annotationsOnRenderItem, setAnnotationsOnRenderItem] =
    React.useState();

  const [localItems, setLocalItems] = React.useState();
  const [localContainerNode, setLocalContainerNode] = React.useState();

  const annotationsSidebarConfig = React.useMemo(
    () =>
      ({ containerNode, items }) => {
        const defaultHeader = containerNode.querySelector(
          ".PSPDFKit-Sidebar-Header"
        );

        if (defaultHeader) {
          defaultHeader.parentNode.removeChild(defaultHeader);
        }

        let customHeaderContainer =
          containerNode.querySelector(".MyCustomHeader");

        if (!customHeaderContainer) {
          customHeaderContainer = addCustomHeader(containerNode);
        }

        if (items !== localItems) {
          setLocalItems(items);
        }

        if (customHeaderContainer !== localContainerNode) {
          setLocalContainerNode(customHeaderContainer);
        }

        return {
          node: containerNode,
          ...(annotationsOnRenderItem
            ? { onRenderItem: annotationsOnRenderItem }
            : null),
        };
      },
    [annotationsOnRenderItem, localItems, localContainerNode]
  );

  const searchSidebarConfig = useStableCallback(({ containerNode }) => {
    setLocalContainerNode(containerNode);

    return { node: containerNode };
  });

  const simpleSidebarConfig = useStableCallback(({ containerNode }) => {
    setLocalContainerNode(containerNode);

    return { node: containerNode };
  });

  const thumbnailsSidebarConfig = React.useMemo(
    () =>
      ({ containerNode }) => {
        const defaultHeader = containerNode.querySelector(
          ".PSPDFKit-Sidebar-Header"
        );

        if (defaultHeader) {
          defaultHeader.parentNode.removeChild(defaultHeader);
        }

        let customHeaderContainer =
          containerNode.querySelector(".MyCustomHeader");

        if (!customHeaderContainer) {
          customHeaderContainer = addCustomHeader(containerNode);
        }

        if (customHeaderContainer !== localContainerNode) {
          setLocalContainerNode(customHeaderContainer);
        }

        return { node: containerNode };
      },
    [localContainerNode]
  );

  const [customSidebarId, setCustomSidebarId] = React.useState("");

  const [searchState, setSearchState] = React.useState(
    PSPDFKit.Immutable.List([])
  );

  // Sidebar UI customization configuration callback
  const customUI = React.useMemo(
    () => ({
      [PSPDFKit.UIElement.Sidebar]: {
        [PSPDFKit.SidebarMode.ANNOTATIONS]: annotationsSidebarConfig,
        [PSPDFKit.SidebarMode.THUMBNAILS]: thumbnailsSidebarConfig,
        [PSPDFKit.SidebarMode.CUSTOM]:
          customSidebarId === "custom-search-results"
            ? searchSidebarConfig
            : simpleSidebarConfig,
      },
    }),
    [
      annotationsSidebarConfig,
      searchSidebarConfig,
      simpleSidebarConfig,
      thumbnailsSidebarConfig,
      customSidebarId,
    ]
  );

  const instance = usePSPDFKitInstance(
    PSPDFKitConfiguration,
    PSPDFKitLoaded,
    customUI,
    setCustomSidebarId
  );

  React.useEffect(() => {
    if (!instance) return;

    instance.setCustomUIConfiguration(customUI);
  }, [instance, customUI]);

  const viewState = instance ? instance.viewState : null;

  // Load completion logic
  React.useEffect(() => {
    if (!instance) return;

    instance.addEventListener("search.stateChange", setSearchState);
    instance.addEventListener("viewState.change", setSelectedButtonsState);

    return () => {
      instance.removeEventListener("search.stateChange", setSearchState);
      instance.removeEventListener("viewState.change", setSelectedButtonsState);
    };
  }, [instance]);

  // Custom Search Results Sidebar

  // Switch to search results sidebar when search is triggered
  React.useEffect(() => {
    if (!instance) return;

    if (
      instance.viewState.sidebarMode !== PSPDFKit.SidebarMode.CUSTOM &&
      isSearching(searchState)
    ) {
      instance.setViewState((viewState) =>
        viewState.set("sidebarMode", PSPDFKit.SidebarMode.CUSTOM)
      );
      setCustomSidebarId("custom-search-results");
    }
  }, [searchState, instance]);

  const isCustomSearchSidebarEnabled =
    viewState &&
    viewState.sidebarMode === PSPDFKit.SidebarMode.CUSTOM &&
    customSidebarId === "custom-search-results" &&
    localContainerNode;

  const isCustomSimpleSidebarEnabled =
    viewState &&
    viewState.sidebarMode === PSPDFKit.SidebarMode.CUSTOM &&
    customSidebarId === "custom-simple" &&
    localContainerNode;

  const isAnnotationsSidebarEnabled =
    viewState &&
    viewState.sidebarMode === PSPDFKit.SidebarMode.ANNOTATIONS &&
    localContainerNode;

  const isThumbnailsSidebarEnabled =
    viewState &&
    viewState.sidebarMode === PSPDFKit.SidebarMode.THUMBNAILS &&
    localContainerNode;

  return (
    <div>
      {isCustomSearchSidebarEnabled
        ? ReactDOM.createPortal(
            <CustomSearchSidebar
              instance={instance}
              searchState={searchState}
            />,
            localContainerNode
          )
        : null}
      {isAnnotationsSidebarEnabled
        ? ReactDOM.createPortal(
            <AnnotationsTypeFilter
              setAnnotationsOnRenderItem={setAnnotationsOnRenderItem}
              items={localItems}
            />,
            localContainerNode
          )
        : null}
      {isCustomSimpleSidebarEnabled
        ? ReactDOM.createPortal(<CustomSimpleSidebar />, localContainerNode)
        : null}
      {isThumbnailsSidebarEnabled
        ? ReactDOM.createPortal(
            <CustomizedThumbnailsSidebarHeader />,
            localContainerNode
          )
        : null}
    </div>
  );
}

function isSearching(searchState) {
  return (
    searchState &&
    searchState.term !== "" &&
    searchState.results &&
    searchState.results.size > 0
  );
}

function addCustomHeader(containerNode) {
  const customHeaderContainer = document.createElement("div");

  customHeaderContainer.classList.add("MyCustomHeader");

  if (containerNode.firstChild) {
    containerNode.insertBefore(customHeaderContainer, containerNode.firstChild);
  } else {
    containerNode.appendChild(customHeaderContainer);
  }

  return customHeaderContainer;
}
