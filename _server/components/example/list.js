import React from "react";

import examples from "../../examples";
import ResetButton from "../buttons/reset-button";

export default function ExampleList({ switchExample, currentExample }) {
  return (
    <React.Fragment>
      {examples.map(
        ({ name, title, description, icon, fileSystemPath }, index) => {
          const id = `example-description-${name}-${index}`;
          return (
            <div style={{ position: "relative" }} key={id}>
              <div
                role="button"
                tabIndex={0}
                className={`example ${currentExample === name && "active"}`}
                onClick={() => switchExample(name)}
                onKeyPress={e => {
                  ["Enter", "Space"].includes(e.key) && switchExample(name);
                }}
                aria-label={`${title} example`}
                aria-describedby={id}
              >
                <div
                  aria-hidden="true"
                  className="icon"
                  dangerouslySetInnerHTML={{ __html: icon }}
                />
                <div className="content">
                  <h3 className="title">{title}</h3>
                  <div
                    id={id}
                    className="description"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </div>
              </div>
              <a
                className="github-link"
                onClick={e => e.stopPropagation()}
                target="_blank"
                href={`https://github.com/PSPDFKit/pspdfkit-web-examples-catalog/tree/master/examples/${fileSystemPath}`}
                aria-label={`See the ${name} example on github`}
              >
                Show on <strong>GitHub</strong>
                <span className="github-icon" />
              </a>
            </div>
          );
        }
      )}
      <div className="reset">
        <ResetButton />
      </div>
      <style jsx>
        {`
          .example {
            position: relative;
            background: #fff;
            margin-bottom: 7px;
            padding: 12px 12px 12px 17px;
            border-radius: 5px;
            display: flex;
            text-decoration: none;
            color: #464e55;
          }

          .example:hover {
            cursor: pointer;
            background: #ddf5f6;
          }

          .example.active {
            background: #4484e3;
            color: #eff1f5;
          }

          .example.active .title {
            color: #fff;
          }

          .title {
            max-width: calc(100% - 100px);
            text-decoration: none;
            color: #485056;
            margin: 0;
            padding: 0;
            margin-bottom: 7px;
            font-size: 14px;
          }

          .icon {
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

          .github-link {
            position: absolute;
            right: 6px;
            top: 6px;
            font-size: 9px;
            background: #eff1f5;
            border-radius: 500px;
            padding: 5px 8px;
            text-decoration: none;
            color: #717e90;
            padding-right: 25px;
            line-height: 1em;
          }

          .github-link .github-icon {
            width: 16px;
            height: 16px;
            display: inline-block;
            background: url(/static/github-dark.svg) no-repeat;
            background-size: 16px;
            position: absolute;
            top: 1px;
            right: 1px;
          }

          .github-link:hover {
            background: #206cd4;
            color: #fff;
          }
          .github-link:hover .github-icon {
            background: url(/static/github-light.svg) no-repeat;
            background-size: 16px;
          }

          .reset {
            margin: 25px 0;
          }

          .description :global(p + p) {
            margin-top: 1em;
          }
        `}
      </style>
    </React.Fragment>
  );
}
