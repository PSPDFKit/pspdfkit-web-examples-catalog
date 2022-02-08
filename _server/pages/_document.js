/*global PSPDFKIT_SERVER_EXTERNAL_URL_OR_PORT, LIB_FILE, LICENSE_KEY*/

import Document, { Head, Main, NextScript } from "next/document";

export default class CustomDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <style>{`
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
            }
          `}</style>
          {/*
           * The script that loads PSPDFKit does not get transpiled by Babel, so
           * we can not reference environment variables there directly.
           */}
          <meta name="pspdfkit-license-key" content={LICENSE_KEY} />
          <meta
            name="pspdfkit-server-url-or-port"
            content={PSPDFKIT_SERVER_EXTERNAL_URL_OR_PORT}
          />
          <meta name="pspdfkit-lib-file" content={LIB_FILE} />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0"
          />

          <link rel="shortcut icon" href="/static/favicon.ico" />
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=UA-57640592-1"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'UA-57640592-1', {
                  'linker': {
                    domains: ['pspdfkit.com']
                  },
                  'anonymize_ip': true,
                  'optimize_id': 'GTM-WXPGPW9',
                });`,
            }}
          />
        </Head>
        <body>
          <Main />

          <script src="/static/load-pspdfkit.js" />
          <NextScript />
        </body>
      </html>
    );
  }
}
