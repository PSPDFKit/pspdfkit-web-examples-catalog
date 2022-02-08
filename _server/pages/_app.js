import React from "react";
import App from "next/app";
import Layout from "../components/layout";
import Router from "next/router";

import { getInitialBackend } from "../components/example/utils";

// A list of examples that trigger a refresh when entering/leaving them. See
// the `Notes` section in README.md
const refreshExamples = [
  "form-designer",
  "flipbook",
  "hello",
  "ap-streams",
  "annotations",
];

export default class MyApp extends App {
  state = {
    // Either "standalone" or "server", depending if we want to open a PDF
    // locally or via PSPDFKit Server
    currentBackend: null,
    // The current example is one of our existing examples and contains a string
    // with the name of the example, like "hello" or "annotations". It could
    // also be "custom" for custom examples.
    currentExample: null,
    // Used to store the Blob of custom standalone examples or the shareable ID
    // when PSPDFKit Server gets used.
    customDocument: null,
    // Indicates if we're currently uploading a custom PDF
    isUploading: false,
  };

  static async getInitialProps() {
    return {};
  }

  componentDidMount() {
    const currentExample = this.props.router.pathname.split("/")[1];

    this.setState({
      currentBackend: getInitialBackend(),
      currentExample,
      customDocument: currentExample === "custom" && this.props.router.query.i,
    });

    // "Reminder" for mobile Safari to not enable default user scaling. When
    // testing the 2019.5 release we noticed that iOS 12.4.1 on _some_ devices
    // (iPhone X) was ignoring the user-scalable part causing it to zoom in
    // whenever a node is focused with a below 16px font-size.
    //
    // We found out that updating the content meta tag's user-scalable part from
    // 0 to no (which is equivalent and also supported on iOS) after a bit would
    // be enough to get the desired behavior.
    //
    // @see https://github.com/PSPDFKit/PSPDFKit-Web/issues/3558
    setTimeout(function () {
      const viewport = document.querySelector('meta[name="viewport"]');

      viewport.content = viewport.content.replace(
        "user-scalable=0",
        "user-scalable=no"
      );
    }, 0);
  }

  _switchExample = (nextExample) => {
    if (
      refreshExamples.includes(this.state.currentExample) ||
      refreshExamples.includes(nextExample)
    ) {
      // The form designer example assigns to PSPDFKit.Options, so we need to
      // ensure it hasn't been frozen from a prior call to PSPDFKit.load(), and
      // reset it when switching to other examples.
      location.href = "/" + nextExample;

      return;
    }

    this.setState({
      currentExample: nextExample,
    });
    Router.push(`/${nextExample}`);
  };

  _switchBackend = (nextBackend) => {
    let customEvent;

    if (typeof CustomEvent === "function") {
      customEvent = new CustomEvent("backendchange", {
        detail: {
          backend: nextBackend,
        },
      });
    } else {
      // IE11 does not support the CustomEvent constructor.
      customEvent = document.createEvent("CustomEvent");
      customEvent.initCustomEvent("backendchange", false, false, {
        detail: {
          backend: nextBackend,
        },
      });
    }

    document.body.dispatchEvent(customEvent);

    this.setState(
      {
        currentBackend: nextBackend,
      },
      () => {
        if (refreshExamples.includes(this.state.currentExample)) {
          // The form designer example assigns to PSPDFKit.Options, so we need to
          // ensure it hasn't been frozen from a prior call to PSPDFKit.load(), and
          // reset it when switching to other examples.
          location.href =
            "/" + this.state.currentExample + "?mode=" + nextBackend;
        }
      }
    );
  };

  _showCustomPdf = (customDocument, backend) => {
    const reader = new FileReader();

    reader.readAsArrayBuffer(customDocument);
    reader.addEventListener("load", (event) => {
      this.setState(
        {
          customDocument: event.target.result,
          currentExample: "custom",
          currentBackend: backend,
        },
        () => {
          Router.push("/custom");
        }
      );
    });
  };

  _uploadCustomPdf = async (customDocument) => {
    this.setState({ isUploading: true });

    let form = new FormData();

    form.append("file", customDocument, customDocument.name);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: form,
      credentials: "same-origin",
    }).then((res) => res.json());

    if (!response.error) {
      this.setState(
        {
          currentBackend: "server",
          currentExample: "custom",
          isUploading: false,
          customDocument: response.id,
        },
        () => {
          Router.push({
            pathname: "/custom",
            query: {
              i: response.id,
            },
          });
        }
      );
    } else {
      // When an error happened during upload, we just reset the state and redirect
      // to the initial example
      console.error(response.error);
      this.setState(
        {
          currentBackend: null,
          currentExample: null,
          isUploading: false,
          customDocument: null,
        },
        () => {
          Router.push({
            pathname: "/",
          });
        }
      );
      Router.push("/");
    }
  };

  render() {
    const { Component } = this.props;
    const { currentBackend, currentExample, customDocument } = this.state;

    // Wait until we have determined the backend.
    // @TODO improve this in the future and show everything from the UI that is possible to show upfront
    if (!currentBackend) {
      return null;
    }

    return (
      <Layout
        currentBackend={currentBackend}
        switchBackend={this._switchBackend}
        currentExample={currentExample}
        switchExample={this._switchExample}
        showCustomPdf={this._showCustomPdf}
        serverDocumentId={this.props.router.query.i}
      >
        <Component
          currentBackend={currentBackend}
          currentExample={currentExample}
          customDocument={customDocument}
          showCustomPdf={this._showCustomPdf}
          uploadCustomPdf={this._uploadCustomPdf}
          isUploading={this.state.isUploading}
        />
      </Layout>
    );
  }
}
