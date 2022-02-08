import * as React from "react";
import { useStableCallback } from "../utils/common";

// Custom sidebar React component
export function CustomSearchSidebar({ instance, searchState }) {
  const jumpToHighlightedText = useStableCallback(
    (searchResult, resultIndex) => {
      instance.setSearchState(
        searchState.set("focusedResultIndex", resultIndex)
      );

      instance.jumpToRect(
        searchResult.pageIndex,
        searchResult.isAnnotation
          ? searchResult.annotationRect
          : PSPDFKit.Geometry.Rect.union(searchResult.rectsOnPage)
      );
    }
  );

  return (
    <div>
      <div>
        <div className="customSidebarHeader">
          {searchState && searchState.results ? (
            <h2>
              <span>Search results</span>
              <span className="customSidebarResultsNumber">{`${
                searchState.focusedResultIndex !== -1
                  ? searchState.focusedResultIndex + 1
                  : 0
              } of ${searchState.results.size}`}</span>
            </h2>
          ) : (
            <h2>No search results</h2>
          )}
        </div>
        {searchState &&
          searchState.results &&
          searchState.results.map((searchResult, searchResultIndex) => {
            const resultItem = (
              <li key={searchResultIndex} className="customSidebarResult">
                {highlightTerm(
                  searchResult.previewText,
                  searchState.term,
                  searchResult.locationInPreview,
                  () => jumpToHighlightedText(searchResult, searchResultIndex)
                )}
              </li>
            );

            if (
              searchResultIndex === 0 ||
              searchState.results.get(searchResultIndex - 1).pageIndex !==
                searchResult.pageIndex
            ) {
              return [
                <header
                  key={`page-${searchResult.pageIndex}`}
                  className="customSidebarPageHeader"
                >{`Page ${searchResult.pageIndex}`}</header>,
                resultItem,
              ];
            }

            return resultItem;
          })}
      </div>
    </div>
  );
}

function highlightTerm(text, term, locationInPreview, callback) {
  return [
    text.substring(0, locationInPreview),
    <mark onClick={callback} style={{ cursor: "pointer" }} key="1">
      {text.substring(locationInPreview, locationInPreview + term.length)}
    </mark>,
    text.substring(locationInPreview + term.length),
  ];
}
