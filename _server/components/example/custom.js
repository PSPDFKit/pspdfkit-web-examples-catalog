import React from "react";
import PSPDFKit from "@nutrient-sdk/viewer";
import Head from "next/head";

import {
  getDefaultOptions,
  getDefaultToolbarItems,
  getDynamicFontsUrl,
} from "./utils";

/**
 * The custom example is used to let a user open its own PDF with Nutrient Web SDK.
 */
export default class CustomExample extends React.Component {
  async load() {
    const { customDocument } = this.props;
    let instance;

    const toolbarItems = getDefaultToolbarItems();

    if (this.props.currentBackend === "server") {
      const res = await fetch(`/api/instant/${customDocument}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const response = await res.json();

      instance = await PSPDFKit.load({
        ...getDefaultOptions("server"),
        authPayload: {
          jwt: response.jwt,
        },
        documentId: response.documentId,
        container: "#nutrient-container",
        toolbarItems,
        theme: PSPDFKit.Theme.AUTO,
        initialViewState: new PSPDFKit.ViewState({
          showSignatureValidationStatus:
            PSPDFKit.ShowSignatureValidationStatusMode.IF_SIGNED,
        }),
        enableRichText: () => true,
        enableClipboardActions: true,
      });
    } else {
      instance = await PSPDFKit.load({
        ...getDefaultOptions("standalone"),
        dynamicFonts: getDynamicFontsUrl(),
        document: customDocument,
        container: "#nutrient-container",
        toolbarItems,
        theme: PSPDFKit.Theme.AUTO,
        initialViewState: new PSPDFKit.ViewState({
          showSignatureValidationStatus:
            PSPDFKit.ShowSignatureValidationStatusMode.IF_SIGNED,
        }),
        enableRichText: () => true,
        enableClipboardActions: true,
      });
    }

    // We expose the instance as a global variable to make debugging in the
    // console easier.
    window.instance = instance;
  }

  unload() {
    PSPDFKit.unload("#nutrient-container");
  }

  componentDidUpdate(prevProps) {
    if (prevProps.customDocument !== this.props.customDocument) {
      this.unload();
      this.load();
    }
  }

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.unload();
  }

  render() {
    return (
      <React.Fragment>
        {this.props.currentBackend === "server" && (
          <Head>
            <meta property="og:title" content="Nutrient Web SDK Example" />
            <meta property="og:type" content="image/jpeg" />
            <meta property="og:url" content={location.href} />
            <meta
              property="og:image"
              content={`${location.protocol}//${location.host}/custom/${this.props.customDocument}/cover`}
            />
          </Head>
        )}
        <div
          id="nutrient-container"
          className="container"
          ref={this.container}
        />

        <style jsx>{`
          .container {
            height: 100%;
            width: 100%;
            background: #f6f8fa;
          }
        `}</style>
      </React.Fragment>
    );
  }
}
