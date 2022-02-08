import PSPDFKit from "pspdfkit";
import * as React from "react";
import { useIcon, useStableCallback, closest } from "../utils/common";

export function AnnotationsTypeFilter({ setAnnotationsOnRenderItem, items }) {
  const CheckmarkIcon = useIcon("/customized-sidebars/static/checkmark.svg");

  const [annotationFilters, setAnnotationFilters] =
    React.useState(annotationTypes);

  const shouldRenderItemCallback = React.useCallback(
    (item) =>
      annotationFilters.some(
        (annotationType) =>
          item instanceof PSPDFKit.Annotations[`${annotationType}Annotation`]
      ),
    [annotationFilters]
  );

  const annotationsOnRenderItem = React.useCallback(
    ({ itemContainerNode, item }) => {
      itemContainerNode.style.display = shouldRenderItemCallback(item)
        ? "block"
        : "none";
    },
    [shouldRenderItemCallback]
  );

  React.useEffect(() => {
    setAnnotationsOnRenderItem(() => annotationsOnRenderItem);
  }, [setAnnotationsOnRenderItem, annotationsOnRenderItem]);

  const handleChange = useStableCallback((event) => {
    const annotationType =
      event.target.getAttribute("data-annotationtype") ||
      closest(event.target, "[data-annotationtype]").getAttribute(
        "data-annotationtype"
      );

    event.stopPropagation();

    setAnnotationFilters((annotationFilters) =>
      annotationFilters.includes(annotationType)
        ? annotationFilters.filter((type) => type !== annotationType)
        : annotationFilters.concat([annotationType])
    );
  });

  const [allAnnotationsCount, setAllAnnotationsCount] = React.useState(0);

  const [availableAnnotationTypes, setAvailableAnnotationTypes] =
    React.useState([]);

  const setAnnotationsCountAndAvailableTypes = useStableCallback((items) => {
    const allAnnotations = items ? items.flatten() : PSPDFKit.Immutable.List();

    setAllAnnotationsCount(allAnnotations.size);

    let localAvailableAnnotationTypes = [...availableAnnotationTypes];

    allAnnotations.forEach((item) => {
      if (
        !localAvailableAnnotationTypes.find(
          (annotationType) =>
            item instanceof PSPDFKit.Annotations[`${annotationType}Annotation`]
        )
      ) {
        localAvailableAnnotationTypes.push(
          annotationTypes.find(
            (annotationType) =>
              item instanceof
              PSPDFKit.Annotations[`${annotationType}Annotation`]
          )
        );
      }
    });

    setAvailableAnnotationTypes(localAvailableAnnotationTypes);
  });

  React.useEffect(() => {
    setAnnotationsCountAndAvailableTypes(items);
  }, [setAnnotationsCountAndAvailableTypes, items]);

  const isAnnotationTypeChecked = (annotationType) =>
    annotationFilters.some((type) => annotationType === type);

  const [isFiltersVisible, setIsFiltersVisible] = React.useState(false);

  const toggleFilters = useStableCallback(() => {
    setIsFiltersVisible((isFiltersVisible) => !isFiltersVisible);
  });

  const visibleAnnotationsCount = React.useMemo(
    () =>
      items
        ? items
            .flatten()
            .reduce(
              (acc, item) => acc + (shouldRenderItemCallback(item) ? 1 : 0),
              0
            )
        : 0,
    [items, shouldRenderItemCallback]
  );

  return (
    <>
      <div className="annotationFiltersHeader">
        <span>{`${visibleAnnotationsCount}${
          allAnnotationsCount > visibleAnnotationsCount
            ? ` of ${allAnnotationsCount}`
            : ""
        } Annotations`}</span>
        <FilterButton
          toggleFilters={toggleFilters}
          isFiltersVisible={isFiltersVisible}
          annotationFiltersOffCount={
            annotationTypes.length - annotationFilters.length
          }
        />
      </div>
      {CheckmarkIcon && isFiltersVisible ? (
        <div className="filtersContainer">
          {availableAnnotationTypes.map((annotationType) => (
            <label
              key={annotationType}
              className={`annotationTypeFilter ${
                isAnnotationTypeChecked(annotationType)
                  ? "annotationTypeFilterOn"
                  : "annotationTypeFilterOff"
              }`}
              data-annotationtype={annotationType}
              htmlFor={annotationType}
            >
              <input
                type="checkbox"
                checked={isAnnotationTypeChecked(annotationType)}
                onChange={handleChange}
                id={annotationType}
              />
              <div className="annotationTypeFilterCheckmarkContainer">
                {isAnnotationTypeChecked(annotationType) ? CheckmarkIcon : null}
              </div>
              {annotationType}
            </label>
          ))}
          {annotationFilters.length < annotationTypes.length ? (
            <label
              key="show-all"
              className="showAllButton"
              onClick={() => {
                setAnnotationFilters(annotationTypes);
              }}
            >
              Show All
            </label>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

const FilterButton = ({
  toggleFilters,
  isFiltersVisible,
  annotationFiltersOffCount,
}) => {
  const FilterIcon = useIcon("/customized-sidebars/static/filter.svg");

  return (
    <label
      htmlFor="filtersToggle"
      className={`filtersToggleButton ${
        isFiltersVisible
          ? "filtersVisible"
          : annotationFiltersOffCount > 0
          ? "filtersOffHidden"
          : "filtersHidden"
      }`}
    >
      {FilterIcon ? (
        <>
          <input
            type="checkbox"
            id="filtersToggle"
            checked={isFiltersVisible}
            onChange={toggleFilters}
          />
          <div className="filtersToggleButtonContainer" />
        </>
      ) : null}
    </label>
  );
};

const annotationTypes = [
  "Text",
  "Highlight",
  "Squiggle",
  "StrikeOut",
  "Underline",
  "Line",
  "Rectangle",
  "Ellipse",
  "Polyline",
  "Polygon",
  "Note",
  "Ink",
  "Image",
  "Stamp",
  "Redaction",
  "Widget",
  "Link",
];
