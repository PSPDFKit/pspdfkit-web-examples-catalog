const path = require("path");

module.exports = {
  webpack(config) {
    // We alias all imports of "@nutrient-sdk/viewer" to a local shim. This way we can use
    // the nutrient-viewer.js file that is served by Nutrient Document Engine.
    config.resolve.alias["@nutrient-sdk/viewer"] = path.resolve(
      __dirname,
      "shims/nutrient-viewer.js"
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

    return config;
  },
};
