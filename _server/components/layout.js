import ExampleList from "./example/list";
import React from "react";
import PSPDFKit from "pspdfkit";
import InstantButton from "./buttons/instant-button";
import StandaloneDocumentButton from "./buttons/standalone-document-button";

export default class Layout extends React.Component {
  state = { showMobileSidebar: false };

  _switchMobileBackend = nextBackend => {
    const { currentBackend, switchBackend } = this.props;
    // When clicking again on the current Backend in our switcher, we want to toggle the sidebar.
    if (currentBackend === nextBackend) {
      this.setState(prevState => {
        return { showMobileSidebar: !prevState.showMobileSidebar };
      });
    } else {
      this.setState({ showMobileSidebar: true });
    }
    if (currentBackend !== nextBackend) {
      switchBackend(nextBackend);
    }
  };

  _switchExample = nextExample => {
    // When switching examples, we want to hide the mobile sidebar
    this.setState({ showMobileSidebar: false });
    this.props.switchExample(nextExample);
  };

  _showCustomStandalonePdf = pdf => {
    // When opening a custom PDF, we want to hide the mobile sidebar
    this.setState({ showMobileSidebar: false });
    this.props.showCustomPdf(pdf, "standalone");
  };

  render() {
    const {
      header,
      children,
      currentBackend,
      switchBackend,
      currentExample,
      serverDocumentId
    } = this.props;

    const { showMobileSidebar } = this.state;

    return (
      <div className={`layout ${showMobileSidebar ? "sidebar-open" : ""}`}>
        <header>
          <div className="logo">
            <img src="static/logo-light.png" />
            <a
              href={blogPostUrlForVersion(PSPDFKit.version)}
              target="_blank"
              className="version"
            >
              {PSPDFKit.version}
            </a>
          </div>
          <div className="switcher-mobile">
            <button
              className={currentBackend === "standalone" && "active"}
              onClick={() => this._switchMobileBackend("standalone")}
            >
              Standalone
            </button>
            <button
              className={currentBackend === "server" && "active"}
              onClick={() => this._switchMobileBackend("server")}
            >
              Server
            </button>
          </div>
        </header>
        <aside>
          <div className="top">
            <div className="logo">
              <img src="static/logo-dark.png" alt="PSPDFKit logo" />
              <div className="version">
                Version:{" "}
                <a
                  href={blogPostUrlForVersion(PSPDFKit.version)}
                  target="_blank"
                >
                  {PSPDFKit.version}
                </a>
              </div>
            </div>
            {/* Only display the switcher when we are not showing a custom example */}
            {currentExample !== "custom" && (
              <div className="switcher">
                <strong className="current-backend">
                  {currentBackend === "server" ? "Server" : "Standalone"}
                </strong>
                {currentBackend === "server" ? (
                  <button onClick={() => switchBackend("standalone")}>
                    Switch to Standalone
                  </button>
                ) : (
                  <button onClick={() => switchBackend("server")}>
                    Switch to Server
                  </button>
                )}
              </div>
            )}
            {currentBackend === "standalone" ? (
              <p>
                The absence of a server component makes it easier to integrate
                this solution and allows you to rapidly deploy it into your
                existing website.
                <StandaloneDocumentButton
                  showCustomPdf={this._showCustomStandalonePdf}
                />
              </p>
            ) : (
              <p>
                Our Server Backend is pre-rendering PDFs for optimal performance
                on all devices. It’s easy to deploy on your own environment.
                <br />
                <InstantButton
                  instantUrl={`${location.protocol}//${
                    location.host
                  }/api/instant/${serverDocumentId}`}
                />
              </p>
            )}
          </div>
          <div className="examples">
            <ExampleList
              currentExample={currentExample}
              switchExample={this._switchExample}
            />
          </div>
        </aside>
        <section>{children}</section>

        <style jsx global>{`
          body {
            background: #fff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
              sans-serif;
            color: #32383e;
            font-size: 13px;
            line-height: 1.5em;
            -ms-content-zooming: none;
          }
          p {
            margin: 0;
            padding: 0;
          }
          a {
            color: #267ad3;
          }
          a:hover {
            color: #23527c;
          }
          button {
            color: #3e464d;
            background: #eff1f5;
            border: none;
            border-radius: 5px;
            font-weight: 500;
            padding: 10px 15px;
            margin-top: 10px;
            cursor: pointer;
            background: #eff1f5;
            text-align: center;
            cursor: pointer;
            font-size: 12px;
          }
          * {
            box-sizing: border-box;
          }
        `}</style>

        <style jsx>{`
          .layout {
            height: 100%;
            width: 100%;
          }

          header {
            width: 100%;
            background: #32383e;
            display: flex;
            justify-content: space-between;
            padding: 0 10px;
            height: 50px;
            align-items: center;
          }

          section {
            width: 100%;
            height: calc(100% - 50px);
          }

          .logo {
            display: flex;
            flex-direction: row;
            height: 100%;
            align-items: center;
          }

          .logo img {
            height: 15px;
          }

          .logo a.version {
            color: #aaa;
            text-decoration: underline;
            margin-left: 10px;
          }

          @media (max-width: 430px) {
            .logo {
              flex-direction: column;
              justify-content: center;
              align-items: flex-start;
            }
            .logo a.version {
              margin-left: 25px;
              font-size: 12px;
            }
          }

          @media (min-width: 576px) {
            .logo img {
              height: 25px;
            }
          }

          aside {
            display: none;
            height: calc(100% - 50px);
            flex-direction: column;
            background: #edf0f5;
          }

          .sidebar-open aside {
            display: flex;
          }

          aside .logo {
            display: none;
          }

          aside .current-backend {
            font-weight: bold;
            font-size: 16px;
          }

          aside .top {
            padding: 20px;
            background: #fff;
            border-bottom: 1px #eee solid;
          }

          aside .switcher {
            display: none;
          }

          .switcher-mobile button {
            margin: 0;
            margin-left: 10px;
            color: #ced6e2;
            background: #3e464d;
            border: none;
          }

          .switcher-mobile button.active {
            background: #fff;
            color: #32383e;
          }

          aside .examples {
            overflow-y: auto;
            padding: 20px;
            flex-grow: 1;
            -webkit-overflow-scrolling: touch;
          }

          .sidebar-open section {
            display: none;
          }

          @media (min-width: 992px) {
            header {
              display: none;
            }

            .layout {
              display: flex;
              flex-direction: row;
            }

            aside {
              width: 380px;
              height: 100%;
              display: flex;
              border-right: 1px #e3e3e3 solid;
              position: relative;
            }

            aside .top {
              padding: 20px;
              box-shadow: 0px 0px 4px rgba(70, 78, 85, 0.1),
                0px 10px 20px rgba(70, 78, 85, 0.1);
            }

            aside .logo {
              margin: -10px 0 0 0;
              height: 50px;
              display: block;
            }

            aside .logo .version {
              color: #777777;
            }

            aside .logo .version a {
              text-decoration: underline;
              color: #777777;
            }

            aside .switcher {
              display: flex;
              flex-flow: row;
              align-items: center;
              justify-content: space-between;
              margin-top: 5px;
              margin-bottom: 5px;
            }

            aside .switcher button {
              background: #e8f0fb;
              margin: 0;
            }

            aside .examples {
              padding: 10px;
              overflow-y: auto;
              max-height: calc(100% - 220px);
            }

            .sidebar-open section,
            section {
              display: block;
              overflow: hidden;
              width: calc(100% - 380px);
              height: 100%;
            }

            header {
              display: none;
            }
          }
        `}</style>
        <style jsx global>{`
          #__next {
            position: fixed;
            height: 100%;
            width: 100%;
          }
        `}</style>
      </div>
    );
  }
}

/**
 * Show the 'PSPDFKit for Web' version number in the header as a link to the
 * release blog post.
 *
 * Note: This presumes blog post urls follow the format:
 *
 * https://pspdfkit.com/blog/<YEAR>/pspdfkit-web-<MAJOR-VERSION>/
 *
 * Example: https://pspdfkit.com/blog/2017/pspdfkit-web-2017-6/
 */
function blogPostUrlForVersion(version) {
  const majorVersion = (version.match(/[0-9]{4}\.[0-9]{1,2}/) || [])[0];
  if (majorVersion) {
    const year = majorVersion.split(".")[0];
    const blogUrl = "https://pspdfkit.com/blog/";
    const postUrl =
      blogUrl + year + "/pspdfkit-web-" + majorVersion.replace(/\./g, "-");
    return postUrl;
  } else {
    return null;
  }
}
