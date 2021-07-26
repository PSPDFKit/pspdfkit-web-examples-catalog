/*
 * In this example we enable the toolbar items for redactions
 * and add a custom sidebar from which a search criteria can
 * be used to create redaction annotations, and from where
 * users can preview and irreversibly apply redactions on
 * the document.
 */

import PSPDFKit from "pspdfkit";
import styles from "./styles";
import * as Icons from "./static/icons";

let instance = null;

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    container: ".container",
    toolbarItems: [
      ...PSPDFKit.defaultToolbarItems,
      { type: "redact-rectangle" },
      { type: "redact-text-highlighter" },
    ],
  }).then((_instance) => {
    console.log("PSPDFKit for Web successfully loaded!!", _instance);
    instance = _instance;

    return _instance;
  });
}

export const CustomContainer = React.forwardRef(() => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <>
      <style jsx>{styles}</style>
      <div className="container-wrapper">
        {
          // Custom overlapping sidebar
        }
        <div className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
          <div className="scroller">
            <header>
              <img src="/redaction/static/redaction.svg" alt="" />
              <h2>Content Redaction Options</h2>
              <p>
                Below you can see an implementation of Search & Redact
                functionality as well as the optional Redaction Preview toggle.
              </p>
            </header>
            <div className="section-header">
              <p>Search & Redact Tools</p>
            </div>
            <SearchSection />
            <div className="section-header">
              <p>Preview & Apply</p>
            </div>
            <PreviewSection />
          </div>
          <button
            className="collapse-handle"
            onClick={() => {
              setCollapsed((val) => !val);
            }}
            aria-label={collapsed ? "Expand" : "Collapse"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <svg
              width="3"
              height="12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 0H0v12h1V0zM3 0H2v12h1V0z" fill="#848C9A" />
            </svg>
          </button>
        </div>
        {
          // PSPDFKit container
        }
        <div className="container" />
      </div>
    </>
  );
});

const SearchSection = () => {
  const [searchType, setSearchType] = React.useState(PSPDFKit.SearchType.TEXT);

  const [searchPattern, setSearchPattern] = React.useState();
  const [searchInAnn, setSearchInAnn] = React.useState(true);

  React.useEffect(() => {
    if (searchType === PSPDFKit.SearchType.PRESET) {
      setSearchPattern(PSPDFKit.SearchPattern.CREDIT_CARD_NUMBER);
    } else {
      setSearchPattern("");
    }
  }, [searchType]);

  return (
    <>
      <style jsx>{styles}</style>
      <section className="section">
        <SearchTypeBar value={searchType} setter={setSearchType} />
        <label>
          <p>
            <strong>Search for:</strong>
          </p>
          {searchType === PSPDFKit.SearchType.PRESET ? (
            <div>
              <PresetSelect value={searchPattern} setter={setSearchPattern} />
              <p>
                <small>
                  Verify the annotations created by applying a preset to discard
                  false positive results.{" "}
                  <a
                    href="https://pspdfkit.com/api/web/PSPDFKit.html#.SearchPattern"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Learn more about search patterns"
                  >
                    Learn more
                  </a>
                  .
                </small>
              </p>
            </div>
          ) : (
            <input
              id="search-pattern"
              type="text"
              className="search-input"
              onChange={(e) => setSearchPattern(e.target.value)}
            />
          )}
        </label>
        <div>
          <input
            type="checkbox"
            checked={searchInAnn}
            onChange={(e) => setSearchInAnn(e.target.checked)}
            id="search-in-annot-check"
          />
          <label htmlFor="search-in-annot-check">
            Search inside annotations
          </label>
        </div>
        <button
          onClick={async () => {
            if (!searchPattern) {
              return window.alert("Search pattern cannot be empty");
            }

            // This method will automatically create new redaction annotations
            const matches = await instance.createRedactionsBySearch(
              searchPattern,
              {
                searchType,
                searchInAnnotations: searchInAnn,
              }
            );

            if (!matches || !matches.size) {
              return window.alert("No matches were found");
            }
          }}
          className="large-btn align-right mark-btn"
        >
          Mark for Redaction
        </button>
      </section>
    </>
  );
};

const PreviewSection = () => {
  const [isPreviewing, setIsPreviewing] = React.useState(false);

  React.useEffect(() => {
    if (instance) {
      // the "previewRedactionMode" flag will toggle between mark and redacted
      instance.setViewState((vs) =>
        vs.set("previewRedactionMode", isPreviewing)
      );
    }
  }, [isPreviewing]);

  const clearAnnotations = async () => {
    for (let i = 0; i < instance.totalPageCount; i++) {
      const anns = await instance.getAnnotations(i);
      const redactionAnns = anns
        .filter(
          (ann) => ann instanceof PSPDFKit.Annotations.RedactionAnnotation
        )
        .map((ann) => ann.id);

      instance.delete(redactionAnns);
    }
  };

  return (
    <>
      <style jsx>{styles}</style>
      <section className="preview-section">
        <div className="form-section-bar">
          <div
            className="form-section-desc"
            onClick={() => setIsPreviewing((val) => !val)}
          >
            <p>
              <strong>Redaction Preview</strong>
            </p>
            <p>{isPreviewing ? "On" : "Off"}</p>
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={isPreviewing}
            onChange={(e) => setIsPreviewing(e.target.checked)}
            id="redaction-preview-input"
          />
          <label
            className={`img-btn ${isPreviewing ? "btn-active" : ""}`}
            htmlFor="redaction-preview-input"
          >
            <span className="sr-only">Redaction preview</span>
            <Icons.RedactionPreview />
          </label>
        </div>
        <div className="btn-group confirm-btns">
          <button className="btn-plain" onClick={clearAnnotations}>
            Clear
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              // This method will reload the current document with the
              // applied redactions.
              instance.applyRedactions();
            }}
          >
            Apply
          </button>
        </div>
      </section>
    </>
  );
};

const SearchTypeBar = (props) => {
  const { value, setter } = props;

  const searchTypesMap = {
    [PSPDFKit.SearchType.TEXT]: "Text",
    [PSPDFKit.SearchType.PRESET]: "Preset",
    [PSPDFKit.SearchType.REGEX]: "Regex",
  };

  return (
    <>
      <style jsx>{styles}</style>
      <fieldset>
        <legend className="sr-only">Search Type</legend>
        <div className="form-section-bar">
          <div className="form-section-desc">
            <p>
              <strong>Search Type</strong>
            </p>
            <p>{searchTypesMap[value]}</p>
          </div>
          <div className="btn-bar">
            <input
              type="radio"
              id="text-search-pattern"
              name="search-type"
              className="sr-only"
              checked={value === PSPDFKit.SearchType.TEXT}
              onChange={(e) => {
                if (e.target.checked) {
                  setter(PSPDFKit.SearchType.TEXT);
                }
              }}
            />
            <label
              className={`img-btn ${
                value === PSPDFKit.SearchType.TEXT ? "btn-active" : ""
              }`}
              htmlFor="text-search-pattern"
            >
              <span className="sr-only">Text</span>
              <Icons.TextRedactionSearch />
            </label>

            <input
              type="radio"
              id="preset-search-pattern"
              name="search-type"
              className="sr-only"
              checked={value === PSPDFKit.SearchType.PRESET}
              onChange={(e) => {
                if (e.target.checked) {
                  setter(PSPDFKit.SearchType.PRESET);
                }
              }}
            />
            <label
              className={`img-btn ${
                value === PSPDFKit.SearchType.PRESET ? "btn-active" : ""
              }`}
              htmlFor="preset-search-pattern"
            >
              <span className="sr-only">Preset</span>
              <Icons.PatternRedactionSearch />
            </label>
            <input
              type="radio"
              name="search-type"
              id="regex-search-pattern"
              className="sr-only"
              checked={value === PSPDFKit.SearchType.REGEX}
              onChange={(e) => {
                if (e.target.checked) {
                  setter(PSPDFKit.SearchType.REGEX);
                }
              }}
            />
            <label
              className={`img-btn ${
                value === PSPDFKit.SearchType.REGEX ? "btn-active" : ""
              }`}
              htmlFor="regex-search-pattern"
            >
              <span className="sr-only">Regular expression</span>
              <Icons.RegexRedactionSearch />
            </label>
          </div>
        </div>
      </fieldset>
    </>
  );
};

const PresetSelect = (props) => {
  const { value, setter } = props;

  const { SearchPattern } = PSPDFKit;
  const presetsMap = {
    CREDIT_CARD_NUMBER: "Credit card number",
    DATE: "Date",
    TIME: "Time",
    EMAIL_ADDRESS: "E-mail address",
    INTERNATIONAL_PHONE_NUMBER: "International phone number",
    IP_V4: "IPv4 address",
    IP_V6: "IPv6 address",
    MAC_ADDRESS: "MAC address",
    NORTH_AMERICAN_PHONE_NUMBER: "North American phone number",
    SOCIAL_SECURITY_NUMBER: "Social Security number",
    URL: "URL",
    US_ZIP_CODE: "U.S. zip code",
    VIN: "VIN",
  };

  return (
    <>
      <style jsx>{styles}</style>
      <select
        value={value}
        onChange={(e) => setter(e.target.value)}
        id="search-pattern"
        className="search-input"
      >
        {Object.keys(SearchPattern).map((key) => (
          <option key={key} value={SearchPattern[key]}>
            {presetsMap[key]}
          </option>
        ))}
      </select>
    </>
  );
};
