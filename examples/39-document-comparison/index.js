import PSPDFKit from "pspdfkit";
import styles from "./static/styles";

let globalSetIsServer;

export function load(defaultConfiguration) {
  if (defaultConfiguration.authPayload) {
    globalSetIsServer && globalSetIsServer(true);

    return;
  }

  globalSetIsServer && globalSetIsServer(false);

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: [
      { type: "document-comparison" },
      { type: "pan" },
      { type: "zoom-in" },
      { type: "zoom-out" },
    ],
  }).then((instance) => {
    instance.setDocumentComparisonMode({
      documentA: { source: "document-comparison/static/documentA.pdf" },
      documentB: { source: "document-comparison/static/documentB.pdf" },
      autoCompare: true,
    });

    return instance;
  });
}

/**
 * This section is not relevant for the demo. This is just a UI implementation of message that we show
 * if the user is running the server setup in our catalog examples to tell the user that
 * we don't support this feature in server mode. You can ignore this.
 */
export const CustomContainer = React.forwardRef((props, ref) => {
  const [showCompare, setShowCompare] = React.useState(false);

  const [isServer, setIsServer] = React.useState(false);

  React.useEffect(() => {
    globalSetIsServer = setIsServer;
  }, [setIsServer]);

  const Intro = (
    <div className="phases__phase">
      <style jsx>{styles}</style>
      <div className="info">
        <div className="info-content">
          <span className="comparison-icon">
            <InlineSvgComponent src={require("./static/comparison.js")} />
          </span>
          <h2>Comparison Example</h2>
          <p>{exampleComparisonIntroMessage}</p>
          <button
            className="intro__continue"
            onClick={() => setShowCompare(true)}
          >
            Compare Documents
          </button>
        </div>
      </div>
    </div>
  );
  const showIntro = !isServer && !showCompare;
  const ServerWarning = (
    <div className="phases__phase">
      <style jsx>{styles}</style>
      <div className="info">
        <div className="info-content">
          <span className="info-icon">
            <InlineSvgComponent src={require("./static/information.js")} />
          </span>
          <h2>Not available in server mode</h2>
          <p>{exampleNotSupportedMessage}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100%" }}>
      <div
        id="pspdfkit"
        className="container"
        ref={ref}
        style={{ height: "100%" }}
      ></div>
      {showIntro ? Intro : isServer ? ServerWarning : null}
    </div>
  );
});

const InlineSvgComponent = ({ src, ...otherProps }) => {
  return <span {...otherProps} dangerouslySetInnerHTML={{ __html: src }} />;
};

const exampleNotSupportedMessage =
  "Document Comparison is only supported on PSPDFKit for Web Standalone.";

const exampleComparisonIntroMessage =
  "Quickly compare, highlight, and identify PDF changes. Use manual document alignment to get a precise comparison.";
