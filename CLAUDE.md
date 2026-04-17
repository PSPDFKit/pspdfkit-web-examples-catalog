# Examples Catalog

Next.js application showcasing SDK examples. Supports both server (Document Engine) and standalone (WebAssembly) backends.

## Commands

```bash
# From parent directory
pnpm start:catalog          # Start catalog on port 3000

# From catalog directory
pnpm dev                    # Development with hot reload
pnpm build && pnpm start    # Production build
```

## Architecture

- **`examples/`** - Numbered example directories (NN-name format), each self-contained
- **`_server/`** - Next.js application with Express server
- **`_server/lib/parse-examples.js`** - Auto-generates pages from example directories

## Example Structure

Each example requires:
- `index.js` - Main code with `load(defaultConfiguration)` export
- `README.md` - Title and description
- `icon.svg` - Catalog icon
- `example.pdf` - Sample PDF
- `static/` - Optional additional resources

```javascript
// index.js pattern
import PSPDFKit from "@nutrient-sdk/viewer"

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    // Custom configuration
  }).then(instance => {
    // Post-load operations
    return instance
  })
}
```

## Adding New Examples

1. Create directory: `examples/NN-example-name/`
2. Add required files: `index.js`, `README.md`, `icon.svg`, `example.pdf`
3. Run `pnpm predev` or restart dev server
4. Visit `http://localhost:3000/NN-example-name`

For private examples, add to `examples.config.js`.

## Backend Modes

- **Server mode**: Document Engine backend, JWT auth, real-time collaboration
- **Standalone mode**: WebAssembly processing, client-side only

Switch via UI dropdown or URL param: `?mode=server` or `?mode=standalone`

## Environment Variables

- `WEB_SDK_LICENSE_KEY` - SDK license
- `DOCUMENT_ENGINE_EXTERNAL_URL` - Backend URL
- `CATALOG_PORT` - Server port (default: 3000)
