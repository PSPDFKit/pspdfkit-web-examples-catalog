import Head from "next/head";
import React, { Component, Fragment } from "react";
import { load, unload } from "./utils";

export default class Example extends Component {
  containerRef = React.createRef();
  state = {
    didError: false,
    serverDocument: null,
    instantUrl: null,
    showToolbarPreview: true,
    instance: null,
    forceRerender: {},
  };

  async componentDidUpdate(prevProps, prevState) {
    // We only need to update the PSPDFKit viewer when we switch between
    // different PSPDFKit backend options. All other updates can be
    // ignored.
    if (
      prevProps.currentBackend !== this.props.currentBackend ||
      prevState.forceRerender !== this.state.forceRerender
    ) {
      const { name, fileName, hooks, currentBackend } = this.props;
      const containerRef = this.containerRef.current;

      containerRef && unload(containerRef, hooks.unload);

      try {
        this.setState({ showToolbarPreview: true });

        const instance = await load(
          containerRef,
          name,
          currentBackend,
          hooks.load,
          fileName
        );

        this.setState({ showToolbarPreview: false, instance });
      } catch (error) {
        this.setState({ didError: true, instance: null });
        console.error(error);
      }
    }
  }

  async componentDidMount() {
    // If the user clicks a link to the example which is already open, the
    // default route would overwrite our custom search params.

    const { name, hooks, currentBackend, fileName } = this.props;
    const containerRef = this.containerRef.current;

    containerRef && unload(containerRef, hooks.unload);

    try {
      this.setState({ showToolbarPreview: true });

      const instance = await load(
        containerRef,
        name,
        currentBackend,
        hooks.load,
        fileName
      );

      this.setState({ showToolbarPreview: false, instance });
    } catch (error) {
      this.setState({ didError: true, instance: null });
      console.error(error);
    }
  }

  componentWillUnmount() {
    const { hooks } = this.props;
    const containerRef = this.containerRef.current;

    containerRef && unload(containerRef, hooks.unload);
    this.setState({ showToolbarPreview: true, instance: null });

    window.jwtParameters = {};
  }

  onForceRerender = () => {
    this.setState({
      forceRerender: {},
    });
  };

  render() {
    const { didError } = this.state;
    const { title } = this.props;

    const Container = this.props.hooks.CustomContainer || DefaultContainer;

    return (
      <Fragment>
        <Head>
          <title>{title} | PSPDFKit for Web Example</title>
        </Head>
        <div className="catalog-example">
          {this.state.showToolbarPreview &&
            !this.props.hooks.CustomContainer &&
            !didError && <div className="toolbar-preview" />}

          <Container
            onForceReRender={this.onForceRerender}
            instance={this.state.instance}
            ref={this.containerRef}
          />

          <style jsx>{`
            .toolbar-preview {
              width: 100%;
              height: 44px;
              position: absolute;
              background: #fcfdfe;
              top: 0;
            }

            .catalog-example {
              position: relative;
              background: #f6f8fa;
              width: 100%;
              height: 100%;
              box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
            }

            @media (prefers-color-scheme: dark) {
              .toolbar-preview {
                background: #2b2e36;
              }
              .catalog-example {
                background: #4d525d;
              }
            }
          `}</style>
        </div>
      </Fragment>
    );
  }
}

const DefaultContainer = React.forwardRef((_, ref) => (
  <div className="container" ref={ref} style={{ height: "100%" }} />
));
