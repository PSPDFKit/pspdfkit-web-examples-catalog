const path = require("path");

module.exports = {
  webpack(config) {
    // We alias all imports of "pspdfkit" to a local shim. This way we can use
    // the pspdfkit.js file that is served by PSPDFKit Document Engine.
    config.resolve.alias.pspdfkit = path.resolve(
      __dirname,
      "shims/pspdfkit.js"
    );

    // By default, Next.js will only transpile files within the same root
    // directory of the Next.js server. Since our examples are placed one level
    // higher, we manually patch the babel config to also transpile those files.
    config.module.rules.forEach((rule) => {
      if (rule.include) {
        rule.include = rule.include.map((dir) => {
          if (typeof dir !== "string") {
            return dir;
          }

          return dir.replace(/\/_server$/, "");
        });
      }

      if (rule.oneOf) {
        rule.oneOf.forEach((oneOf) => {
          if (oneOf.include) {
            oneOf.include = Array.isArray(oneOf.include)
              ? oneOf.include.map((dir) => {
                  if (typeof dir !== "string") {
                    return dir;
                  }

                  return dir.replace(/\/_server$/, "");
                })
              : typeof oneOf.include === "string"
              ? oneOf.include.replace(/\/_server$/, "")
              : oneOf.include;
          }
        });
      }
    });

    // We make sure that babel will include our polyfills collection.
    // @see https://github.com/zeit/next.js/blob/canary/examples/with-polyfills
    const originalEntry = config.entry;

    config.entry = async () => {
      const entries = await originalEntry();

      if (entries["main.js"]) {
        entries["main.js"].unshift("./client/polyfills.js");
      }

      return entries;
    };

    return config;
  },
};
