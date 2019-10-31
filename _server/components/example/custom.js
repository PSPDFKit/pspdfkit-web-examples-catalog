import React from "react";
import PSPDFKit from "pspdfkit";
import Head from "next/head";
import { getDefaultOptions, getDefaultToolbarItems } from "./utils";

/**
 * The custom example is used to let a user open its own PDF with PSPDFKit for
 * Web Standalone.
 */
export default class CustomExample extends React.Component {
  async load() {
    const { customPdf } = this.props;
    let instance;

    const toolbarItems = getDefaultToolbarItems();

    if (this.props.currentBackend === "server") {
      const res = await fetch(`/api/instant/${customPdf}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        credentials: "same-origin"
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const response = await res.json();

      instance = await PSPDFKit.load({
        ...getDefaultOptions("server"),
        authPayload: {
          jwt: response.jwt
        },
        documentId: response.documentId,
        container: "#pspdfkit-container",
        toolbarItems,
        theme: PSPDFKit.Theme.AUTO
      });
    } else {
      instance = await PSPDFKit.load({
        ...getDefaultOptions("standalone"),
        pdf: customPdf,
        container: "#pspdfkit-container",
        toolbarItems,
        theme: PSPDFKit.Theme.AUTO
      });
    }

    // We expose the instance as a global variable to make debugging in the
    // console easier.
    window.instance = instance;
  }

  unload() {
    PSPDFKit.unload("#pspdfkit-container");
  }

  componentDidUpdate(prevProps) {
    if (prevProps.customPdf !== this.props.customPdf) {
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
            <meta property="og:title" content="PSPDFKit for Web Example" />
            <meta property="og:type" content="image/jpeg" />
            <meta property="og:url" content={location.href} />
            <meta
              property="og:image"
              content={`${location.protocol}//${location.host}/custom/${
                this.props.customPdf
              }/cover`}
            />
          </Head>
        )}
        <div
          id="pspdfkit-container"
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
