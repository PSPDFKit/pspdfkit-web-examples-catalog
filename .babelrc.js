const env = require("./_server/env-config.js");

module.exports = {
  presets: ["next/babel"],
  plugins: [["transform-define", env]]
};
