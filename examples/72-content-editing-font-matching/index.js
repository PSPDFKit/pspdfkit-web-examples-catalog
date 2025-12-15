import PSPDFKit from "@nutrient-sdk/viewer";
import React from "react";

import styles from "./static/styles";
import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

let instance = null;
let defaultConfiguration = null;
let globalFontSubstitutions = [];
let globalSetFontSubstitutions = null;
let sharedCustomFonts = null;
let firstFontMismatch = null;

// Initialize shared custom fonts once
const getSharedCustomFonts = () => {
  if (!sharedCustomFonts) {
    sharedCustomFonts = [
      new PSPDFKit.Font({
        name: "Avenir.ttf",
        callback: (name) =>
          fetch(`/content-editing-font-matching/static/${name}`).then((resp) =>
            resp.blob()
          ),
      }),
    ];
  }

  return sharedCustomFonts;
};

// Shared PSPDFKit configuration to avoid duplication
const getSharedPSPDFKitConfig = (baseConfig, customOverrides = {}) => {
  const config = {
    ...baseConfig,
    // Only show navigation toolbar items and content editor
    toolbarItems: [
      { type: "sidebar-thumbnails" },
      { type: "sidebar-document-outline" },
      { type: "sidebar-annotations" },
      { type: "zoom-out" },
      { type: "zoom-mode" },
      { type: "zoom-in" },
      { type: "pan" },
      { type: "spacer" },
      { type: "content-editor" },
    ],
    // Font matching callback to capture potential matches
    contentEditingFontMatcher: sharedFontMatcher,
    ...customOverrides,
  };

  // Only add custom fonts in standalone mode (server mode doesn't support them)
  if (baseConfig.serverUrl === undefined) {
    config.customFonts = getSharedCustomFonts();
  }

  return config;
};

// Shared font matcher function to ensure consistency
const sharedFontMatcher = (fontMismatch, fontInfo, availableFonts) => {
  console.log("Font matcher called:", {
    fontMismatch,
    fontInfo,
    availableFonts,
  });

  const requestedFontName = fontInfo.name || fontMismatch;

  // Set the first font mismatch if not already set
  if (firstFontMismatch === null) {
    firstFontMismatch = requestedFontName;
  }

  // Try to find Avenir font in available fonts for the first unique font mismatch
  let selectedFont = null;

  if (requestedFontName === firstFontMismatch) {
    selectedFont = availableFonts.find(
      (font) => font.family && font.family.toLowerCase().includes("avenir")
    );
  }

  // Store the font substitution info for display
  const substitutionInfo = {
    pdfRequested: requestedFontName,
    weAreUsing: selectedFont ? selectedFont.family : fontMismatch,
    isCustomMatched: !!selectedFont,
    fontInfo,
    timestamp: Date.now(),
    id: Math.random().toString(36).substr(2, 9),
  };

  // Add to global substitutions (avoid duplicates)
  if (globalSetFontSubstitutions) {
    const isDuplicate = globalFontSubstitutions.some(
      (existing) =>
        existing.pdfRequested === substitutionInfo.pdfRequested &&
        existing.weAreUsing === substitutionInfo.weAreUsing
    );

    if (!isDuplicate) {
      globalFontSubstitutions = [...globalFontSubstitutions, substitutionInfo];
      globalSetFontSubstitutions(globalFontSubstitutions);
    }
  }

  // Return Avenir font for the first font mismatch, undefined for others
  if (selectedFont) {
    return {
      font: selectedFont,
      size: fontInfo.fontSize,
    };
  }

  return undefined;
};

export function load(_defaultConfiguration) {
  // Nutrient Web SDK freezes the Options object to prevent changes after the first load
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  defaultConfiguration = _defaultConfiguration;

  return PSPDFKit.load(getSharedPSPDFKitConfig(_defaultConfiguration)).then(
    (_instance) => {
      instance = _instance;

      return instance;
    }
  );
}

// Custom container with sidebar for font substitution display
export const CustomContainer = React.forwardRef((_, ref) => {
  const [fontSubstitutions, setFontSubstitutions] = React.useState([]);

  // Connect to global font substitutions state
  React.useEffect(() => {
    globalSetFontSubstitutions = setFontSubstitutions;
    globalFontSubstitutions = [];

    return () => {
      globalSetFontSubstitutions = null;
      globalFontSubstitutions = [];
    };
  }, []);

  const uploadFile = (event) => {
    if (!event.target.files.length) {
      return;
    }

    const file = event.target.files[0];
    console.log("File selected:", file);

    // Clear previous substitutions
    globalFontSubstitutions = [];
    setFontSubstitutions([]);
    firstFontMismatch = null;

    // Unload current instance if it exists
    try {
      PSPDFKit.unload(".viewerContainer");
      instance = null;
      console.log("Successfully unloaded previous instance");
    } catch (error) {
      console.error("Error unloading previous instance:", error);
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      console.log(
        "File loaded, loading PSPDFKit with document:",
        e.target.result
      );

      PSPDFKit.load(
        getSharedPSPDFKitConfig(defaultConfiguration, {
          container: ".viewerContainer",
          document: e.target.result,
        })
      )
        .then((_instance) => {
          instance = _instance;
          console.log("PSPDFKit loaded successfully with uploaded file");
        })
        .catch((error) => {
          console.error("Error loading PSPDFKit with uploaded file:", error);
        });
    };

    reader.onerror = function () {
      console.error("Error reading file");
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="customContainer">
      <div className="sidebar">
        <h2>Content Editing Font Matching</h2>

        <fieldset>
          <legend>Instructions</legend>
          <p style={{ fontSize: "14px", lineHeight: "1.4", margin: 0 }}>
            {defaultConfiguration && !defaultConfiguration.serverUrl ? (
              <>
                1. Upload your own PDF or use the default document
                <br />
                2. Click the Content Editor button in the toolbar
                <br />
                3. Font substitutions will appear below
                <br />
                <br />
                <strong>Note:</strong> The first font mismatch will be matched
                to our custom Avenir font and highlighted as "(Custom Font)".
              </>
            ) : (
              <>
                1. Click the Content Editor button in the toolbar
                <br />
                2. Font substitutions will appear below
                <br />
              </>
            )}
          </p>
        </fieldset>

        {defaultConfiguration && !defaultConfiguration.serverUrl && (
          <fieldset>
            <legend>Load custom PDF</legend>
            <input
              type="file"
              accept=".pdf"
              onChange={uploadFile}
              style={{
                width: "100%",
                margin: "10px 0 0 0",
                padding: "8px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "3px",
              }}
            />
          </fieldset>
        )}

        <fieldset>
          <legend>Font Substitutions</legend>
          <div className="fontMatches">
            <h3>Font Substitutions:</h3>
            {fontSubstitutions.length > 0 ? (
              <div>
                {fontSubstitutions.map((substitution) => (
                  <div key={substitution.id} className="substitutionCard">
                    <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
                      <div className="substitutionRow">
                        <span className="substitutionLabel">• PDF</span>
                        <span className="pdfRequested">
                          {substitution.pdfRequested}
                        </span>
                      </div>
                      <div className="substitutionRow">
                        <span className="substitutionLabel">• Match</span>
                        <span
                          className={`weAreUsing ${
                            substitution.isCustomMatched ? "customMatched" : ""
                          }`}
                        >
                          {substitution.weAreUsing}
                          {substitution.isCustomMatched && (
                            <span className="customMatchedLabel">
                              {" "}
                              (Custom Font)
                            </span>
                          )}
                        </span>
                      </div>
                      {substitution.fontInfo.fontSize && (
                        <div className="fontSize">
                          Size: {substitution.fontInfo.fontSize}px
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="noMatches">
                No font substitutions detected yet. Start editing text to see
                font substitutions in action.
              </div>
            )}
          </div>
        </fieldset>
      </div>

      <div className="viewerContainer" ref={ref} />

      <style jsx>{styles}</style>
    </div>
  );
});
