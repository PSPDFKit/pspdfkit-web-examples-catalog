import React from "react";
import classes from "classnames";

import examples from "../../examples";
import ResetButton from "../buttons/reset-button";

export default function ExampleList({
  switchExample,
  currentExample,
  currentBackend,
  filterTerm,
}) {
  const entryRef = React.useRef();

  React.useLayoutEffect(() => {
    if (entryRef.current) {
      entryRef.current.scrollIntoView();
      entryRef.current.parentElement.scrollTop -= 10;
    }
  }, []);

  return (
    <React.Fragment>
      {examples
        .filter((example) => !example.isPrivate)
        .filter(
          ({ name, title, description }) =>
            !filterTerm.trim() ||
            [name, title, description].some((text) =>
              new RegExp(filterTerm.trim(), "gi").test(text)
            )
        )
        .map(({ name, title, description, icon, fileSystemPath }, index) => {
          const id = `example-description-${name}-${index}`;

          return (
            <div
              style={{ position: "relative" }}
              key={id}
              ref={currentExample === name ? entryRef : null}
            >
              <div
                role="button"
                tabIndex={0}
                className={classes("example", currentBackend, {
                  "example--active": name === currentExample,
                })}
                onClick={() => switchExample(name)}
                onKeyPress={(e) => {
                  ["Enter", "Space"].includes(e.key) && switchExample(name);
                }}
                aria-label={`${title} example`}
                aria-describedby={id}
              >
                <div className="example__icon-and-details">
                  <div
                    aria-hidden="true"
                    className="example__icon"
                    dangerouslySetInnerHTML={{ __html: icon }}
                  />
                  <div className="example__details">
                    <h3
                      className="example__title"
                      dangerouslySetInnerHTML={{
                        __html: highlightTermInText(title, filterTerm),
                      }}
                    />
                    <div
                      id={id}
                      className="example__description"
                      dangerouslySetInnerHTML={{
                        __html: highlightTermInText(description, filterTerm),
                      }}
                    />
                  </div>
                </div>

                <div
                  className={classes("example__links", {
                    "example__links--server": currentBackend === "server",
                  })}
                >
                  <a
                    className="example__link example__link--github"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.gtag("event", "Opened in Github", {
                        event_category: "Web Catalog demo",
                        event_label: `Opened Web example in Github: ${name}`,
                      });
                    }}
                    target="_blank"
                    href={`https://github.com/PSPDFKit/pspdfkit-web-examples-catalog/tree/master/examples/${fileSystemPath}`}
                    aria-label={`See the ${name} example on github`}
                  >
                    <div className="example__link-text">
                      Show on <strong>GitHub</strong>
                    </div>

                    <span className="example__link-icon" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}

      <div className="reset-button">
        <ResetButton />
      </div>

      <style jsx>
        {`
          .example {
            position: relative;
            display: flex;
            flex-direction: column;
            background: #fff;
            margin-bottom: 7px;
            padding: 12px 12px 12px 16px;
            border-radius: 5px;
            text-decoration: none;
            color: #464e55;
            cursor: pointer;
          }

          .example--active {
            background: #4537de;
            color: white;
          }

          .example:not(.example--active):hover {
            background: #ddf5f6;
          }

          .example--active .example__title {
            color: #fff;
          }

          .example__icon-and-details {
            display: flex;
          }

          .example__title {
            max-width: calc(100% - 100px);
            text-decoration: none;
            color: #485056;
            margin: 0;
            padding: 0;
            margin-bottom: 7px;
            font-size: 14px;
            font-family: Indivisible, -apple-system, BlinkMacSystemFont,
              "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
              "Helvetica Neue", sans-serif;
            font-variation-settings: "wght" 550;
          }

          .example__icon {
            width: 64px;
            height: 64px;
            background: #fff;
            border-radius: 5px;
            display: block;
            flex-shrink: 0;
            box-shadow: 0px 1px 2px rgba(113, 126, 144, 0.25);
            margin-right: 20px;
            overflow: hidden;
          }

          .example__links {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: 100%;
            margin-top: 8px;
          }

          .example__links--server {
            justify-content: flex-end;
          }

          .example__link {
            display: flex;
            align-items: center;
            font-size: 9px;
            background: #eff1f5;
            border-radius: 50px;
            padding: 0 2px 0 8px;
            text-decoration: none;
            color: #717e90;
          }

          .example__link:hover {
            background: #206cd4;
            color: #fff;
          }

          .example__link-text {
            white-space: nowrap;
          }

          .example__link-icon {
            display: inline-block;
            vertical-align: middle;
            width: 16px;
            height: 16px;
            background-repeat: no-repeat;
            background-size: 16px;
            margin-left: 4px;
          }

          .example__link--github .example__link-icon {
            background-image: url(/static/github-dark.svg);
          }

          .reset-button {
            display: flex;
            align-items: center;
            justify-content: center;

            /* Offset by example padding */
            padding: calc(24px - 7px) 0 24px;
          }

          .description :global(p + p) {
            margin-top: 1em;
          }

          @media (prefers-color-scheme: dark) {
            .example:not(.example--active) {
              background: #333;
              color: white;
            }

            .example--active {
              background: #5e5ceb;
            }

            .example:not(.example--active):hover {
              background: #555;
            }

            .example__title {
              color: white;
            }

            .example__link {
              background: rgba(255, 255, 255, 0.2);
              color: white;
            }

            .example__link--github .example__link-icon {
              background-image: url(/static/github-light.svg);
            }
          }
        `}
      </style>
    </React.Fragment>
  );
}

function highlightTermInText(text, term) {
  if (!term) {
    return text;
  }

  return text.replace(RegExp(term, "gi"), "<mark>$&</mark>");
}
