/*global DOCUMENT_ENGINE_URL_OR_PORT, LIB_FILE, LICENSE_KEY, NUTRIENT_AIA_URL*/
import React from "react";
import { Head, Html, Main, NextScript } from "next/document";

const {
  WEB_SDK_LICENSE_KEY,
  DOCUMENT_ENGINE_EXTERNAL_URL,
  NUTRIENT_AIA_URL,
  WEB_SDK_LIB_SERVE_STRATEGY,
  WEB_SDK_LIB_EXPLICIT_URL,
} = process.env;

const CustomDocument = () => {
  return (
    <Html>
      <Head>
        <style>{`
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
            }
          `}</style>
        {/*
         * The script that loads Nutrient Web SDK does not get transpiled by Babel, so
         * we can not reference environment variables there directly.
         */}
        <meta name="web-sdk-license-key" content={WEB_SDK_LICENSE_KEY} />
        <meta
          name="document-engine-url-or-port"
          content={DOCUMENT_ENGINE_EXTERNAL_URL || "5000"}
        />
        <meta name="nutrient-aia-url" content={NUTRIENT_AIA_URL} />
        <meta
          name="web-sdk-lib-serve-strategy"
          content={WEB_SDK_LIB_SERVE_STRATEGY || "static"}
        />
        <meta
          name="web-sdk-lib-explicit-url"
          content={WEB_SDK_LIB_EXPLICIT_URL || "http://localhost:8080"}
        />
        <meta name="web-sdk-lib-file" content="nutrient-viewer.js" />
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
                    domains: ['www.nutrient.io']
                  },
                  'anonymize_ip': true,
                  'optimize_id': 'GTM-WXPGPW9',
                });`,
          }}
        />
      </Head>
      <body>
        <Main />

        <script src="/static/load-nutrient-viewer.js" />
        <NextScript />
      </body>
    </Html>
  );
};

export default CustomDocument;
