const {
  generatePages,
  generateExamplesIndex,
} = require("../lib/parse-examples");

try {
  generatePages();
  generateExamplesIndex();
} catch (e) {
  console.error("Failed to generate pages and examples index.");
  console.error(e);

  process.exit(1);
}
