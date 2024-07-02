import React from "react";
import Modal from "react-modal";
import QRCode from "qrcode.react";

const modalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    maxWidth: 400,
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    boxShadow: "0 3px 7px rgba(0, 0, 0, 0.3)",
  },
  overlay: {
    background: "rgba(100,100,100,.9)",
  },
};

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#__next");

export default class InstantButton extends React.Component {
  urlInputRef = React.createRef();

  state = { modalIsOpen: false };

  openModal = () => this.setState({ modalIsOpen: true });
  closeModal = () => this.setState({ modalIsOpen: false });

  render() {
    const { protocol, host, pathname } = location;
    const collaborateUrl = `${protocol}//${host}${
      pathname.startsWith("/") ? pathname : "/" + pathname
    }?inapp=true&i=${this.props.documentId}`;

    return (
      <React.Fragment>
        <button onClick={this.openModal} className="button">
          Collaborate in Real-time
        </button>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={modalStyles}
          contentLabel="Instant Example"
        >
          <h1>Collaborate in Real-time</h1>
          <p>
            With{" "}
            <a href="https://pspdfkit.com/instant/" target="_blank">
              PSPDFKit Instant
            </a>
            , it’s easier than ever to add real-time collaboration to your
            application. You can try it out by opening another browser window
            and connect open the following URL:
          </p>
          <input
            className="url"
            type="text"
            aria-label="Sharable url"
            defaultValue={collaborateUrl}
            ref={this.urlInputRef}
            onClick={(event) => {
              this.urlInputRef.current.setSelectionRange(
                0,
                event.target.value.length
              );
            }}
            readOnly
          />
          <p>
            Additionally, you can download our PDF Viewer apps and scan the
            following QR code:
          </p>
          <div className="pdf-viewer">
            <div style={{ position: "relative", width: 128 }}>
              <QRCode value={collaborateUrl} renderAs="svg" level="M" />
              <img
                src="/static/pspdfkit-logo-padded.svg"
                width="50"
                alt="PSPDFKit logo"
                style={{
                  position: "absolute",
                  top: "calc(50% - 25px)",
                  left: "calc(50% - 25px)",
                }}
              />
            </div>
            <div className="pdf-viewer-download">
              <a href="https://itunes.apple.com/app/pdf-viewer-read-review-annotate/id1120099014?ls=1&mt=8">
                <img src="/static/app-store.png" width="135" alt="App Store" />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.pspdfkit.viewer">
                <img
                  src="/static/google-play.png"
                  width="135"
                  alt="Google Play"
                />
              </a>
            </div>
          </div>
          <hr />
          <button onClick={this.closeModal} className="button-close">
            Close
          </button>
        </Modal>
        <style jsx>
          {`
            h1 {
              margin-bottom: 20px;
            }

            hr {
              border: none;
              height: 1px;
              background: #e9edf7;
              margin: 20px 0;
            }

            .button {
              background: white;
            }

            @media (prefers-color-scheme: dark) {
              .button {
                background: rgba(255, 255, 255, 0.1);
                color: white;
              }
            }

            .url {
              display: block;
              width: 100%;
              margin: 20px auto;
              background: #e9edf7;
              background: #f7f9fa;
              border-radius: 5px;
              border: #d8e1e6 1px solid;
              font-weight: bold;
              text-align: center;
              padding: 10px 8px;
            }

            .pdf-viewer {
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
              margin-top: 20px;
            }

            .pdf-viewer-download {
              margin-top: 20px;
            }

            .pdf-viewer-download a {
              margin: 0 5px;
            }

            .button-close {
              width: 100%;
              margin: 0;
            }
          `}
        </style>
      </React.Fragment>
    );
  }
}
