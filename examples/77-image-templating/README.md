# Image templating

Populate DOCX templates with text and image markers (`{{%name}}` / `{{%%name}}`) using base64, data URL aliases, and same-origin URL sources in standalone mode.
In server mode this catalog entry renders a static PDF fallback and does not run templating.

This example now demonstrates:

- URL image source (local signature asset).
- Data URL image source (runtime-converted from a local asset).
- Raw base64 image source (extracted from data URL + explicit format).
- Text placeholders (`{{name}}`, `{{reference}}`) mixed with image placeholders.

Template files in this folder:

- `template.docx` (default contract-style template used by `index.js`).
- `template-compact.docx` (extra compact layout for quick manual experiments).
