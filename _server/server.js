const express = require("express");
const fs = require("fs");
const next = require("next");
const multer = require("multer");
const path = require("path");
const PSPDFKit = require("./lib/pspdfkit");
const { parseExamples } = require("./lib/parse-examples");
const { createJwt, createJwtForCover } = require("./lib/jwt");
const {
  createExampleHash,
  createLayerName,
  decodeShareableId,
  encodeShareableId
} = require("./lib/shareable-ids");

const port = parseInt(process.env.PORT) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: "_server" });
const handle = app.getRequestHandler();
const parsedExamples = parseExamples();
const {
  PSPDFKIT_SERVER_EXTERNAL_URL,
  PSPDFKIT_SERVER_INTERNAL_URL,
  UPLOAD_AUTH_USERNAME,
  UPLOAD_AUTH_PASSWORD
} = process.env;

const INSTANT_LANDING_PAGE_DOCUMENT_ID = "instant-landing-page";

const decodedExampleNames = new Map(
  parseExamples().map(({ name }) => {
    return [createExampleHash(name), name];
  })
);

const { PSPDFKIT_STANDALONE_LICENSE_KEY } = process.env;
if (!PSPDFKIT_STANDALONE_LICENSE_KEY) {
  throw new Error(
    "You have to set the PSPDFKIT_STANDALONE_LICENSE_KEY environment variable."
  );
}

const upload = multer({ dest: "uploads/" });

const simpleHttpAuth = (req, res, next) => {
  // To protect the upload endpoint we check for username and password
  // via simple http auth, but only if these are set in the environment.
  if (UPLOAD_AUTH_USERNAME && UPLOAD_AUTH_PASSWORD) {
    const auth = {
      login: UPLOAD_AUTH_USERNAME,
      password: UPLOAD_AUTH_PASSWORD
    };

    // parse login and password from headers
    const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
    const [login, password] = new Buffer(b64auth, "base64")
      .toString()
      .split(":");

    // Verify login and password are set and correct
    if (
      !login ||
      !password ||
      login !== auth.login ||
      password !== auth.password
    ) {
      res.set("WWW-Authenticate", 'Basic realm="401"'); // change this
      res.status(401).send("Authentication required."); // custom message
      return;
    }
    next();
  } else {
    next();
  }
};

app.prepare().then(() => {
  const server = express();

  // Enable JSON body parsing
  server.use(express.json());

  // We match the main entry point and redirect it to the first example
  server.get("/", (req, res) => res.redirect(`/${parsedExamples[0].name}`));

  server.get("/upload", simpleHttpAuth, (req, res) => {
    return handle(req, res);
  });

  // Enable parsing of multi-part form requests and put the uploaded file into
  // `req.file`
  server.post(
    "/api/upload",
    simpleHttpAuth,
    upload.single("file"),
    async (req, res) => {
      const readStream = fs.createReadStream(req.file.path);

      try {
        const response = await PSPDFKit.documents.upload(
          readStream,
          req.file.originalname
        );
        const documentId = response.document_id;
        const layerName = createLayerName();

        res.json({
          id: encodeShareableId(documentId, layerName)
        });
      } catch (error) {
        res.json({ error: error });
      } finally {
        // Remove the file after we've uploaded it
        fs.unlinkSync(req.file.path);
      }
    }
  );

  // This endpoint gets used for our PDFViewer apps to open an Instant Document.
  // The apps receive the URL by scanning the QR Code that we provide. We get
  // shareable-id and generate a JWT to access the document.
  server.get("/api/instant/:id", (req, res) => {
    [documentId, layerName, exampleHash] = decodeShareableId(req.params.id);

    decodedExampleName = decodedExampleNames.get(exampleHash);

    // If we don't have an example name, it's a custom document and not part
    // of our predefined examples.
    let exampleUrl;
    if (decodedExampleName) {
      exampleUrl = `${req.protocol}://${req.get(
        "host"
      )}/${decodedExampleName}?i=${req.params.id}`;
    } else {
      exampleUrl = `${req.protocol}://${req.get("host")}/custom?i=${
        req.params.id
      }`;
    }

    res.header("Access-Control-Allow-Origin", "*");
    res.json({
      encodedDocumentId: req.params.id,
      documentId: documentId,
      jwt: createJwt(documentId, layerName),
      url: exampleUrl,
      serverUrl: PSPDFKIT_SERVER_EXTERNAL_URL
    });
  });

  server.post("/api/instant-landing-page", async (req, res) => {
    try {
      await PSPDFKit.documents.properties(INSTANT_LANDING_PAGE_DOCUMENT_ID);
    } catch (_error) {
      // The document does not exist yet, we therefore upload it
      const filePath = path.join(
        __dirname,
        "static",
        "instant-landing-page.pdf"
      );
      const readStream = fs.createReadStream(filePath);
      await PSPDFKit.documents.upload(
        readStream,
        INSTANT_LANDING_PAGE_DOCUMENT_ID,
        INSTANT_LANDING_PAGE_DOCUMENT_ID
      );
    }

    const layerName = createLayerName();
    const shareableId = encodeShareableId(
      INSTANT_LANDING_PAGE_DOCUMENT_ID,
      layerName
    );

    res.header("Access-Control-Allow-Origin", "*");
    res.json({
      encodedDocumentId: shareableId,
      documentId: INSTANT_LANDING_PAGE_DOCUMENT_ID,
      jwt: createJwt(INSTANT_LANDING_PAGE_DOCUMENT_ID, layerName),
      url: `${req.protocol}://${req.get("host")}/custom?i=${shareableId}`,
      serverUrl: PSPDFKIT_SERVER_EXTERNAL_URL
    });
  });

  // Redirects to the cover image of the document with a new JWT token
  server.get(`/custom/:id/cover`, (req, res) => {
    [documentId, layerName, _exampleHash] = decodeShareableId(req.params.id);

    const jwt = createJwtForCover(documentId, layerName);
    const url = `${PSPDFKIT_SERVER_INTERNAL_URL}/documents/${documentId}/cover?width=1024&jwt=${jwt}`;
    console.log(url);

    res.redirect(url);
  });

  // For every example, we add a couple of custom routes. These routes are used
  // to load the PDF and other example specific resources.
  parsedExamples.forEach(({ name, fileSystemPath }) => {
    const filePath = path.join(
      __dirname,
      "..",
      "examples",
      fileSystemPath,
      "example.pdf"
    );
    const fileSize = fs.statSync(filePath).size;

    // This route is used to access the raw PDF and is necessary to load the
    // standalone examples.
    // We explicitly set a cache control to 24 hours here since we want to avoid
    // re-fetching this PDF whenever we reload the example.
    server.get(`/${name}/example.pdf`, (req, res) => {
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Length": fileSize,
        "Cache-Control": "public, max-age=86400"
      });
      fs.createReadStream(filePath).pipe(res);
    });

    // For server examples, we'll need advanced authentication information. For
    // every document, we generate a unique shareable id which includes the
    // following information:
    //
    //   - `documentId` of the uploaded Instant document.
    //   - `layerName` to uniquely identify the layer the user is allowed to
    //     make changes on.
    //     The layer might not be present when viewing a legacy document.
    //   - `exampleId` in case the `documentId` is no longer valid and
    //     we have to re-uploaded the document. This can be missing if we're
    //     encoding an id of a custom upload since we could not recover when
    //     this file is missing.
    //     The example might not be present for custom uploads.
    //
    // A client may store the generated unique shareable id in which case we
    // only have to validate if the documentId is still valid (or re-upload in
    // case it's not). This is done by parsing the `previousDocumentId` param
    // from the JSON body. If it is present, we try to reuse the document and
    // layer in there.
    //
    // When no previously generated sharable id is passed, we generate a new
    // one. We keep an in-memory store of already uploaded example PDFs so when
    // we request a new shareable id for the same example, we only rotate the
    // layerName portion of the key. This will increase performance since we do
    // not need to re-upload the same document.
    //
    // In case of a server restart, this in-memory information is wiped and we
    // have to re-upload the document. PSPDFKit Server is smart enough to notice
    // that the same PDF is already stored and won't require additional storage,
    // so this is acceptable.
    //
    // If, for any reason, the documentId is no longer valid (which usually
    // means that PSPDFKit Server was wiped or the document was manually
    // deleted), we also clear our local cache and re-upload.
    //
    // @see https://pspdfkit.com/guides/server/current/api/documents/
    // @see https://pspdfkit.com/guides/server/current/api/instant-layers/
    let cachedExampleDocumentId = null;
    server.post(`/server-document/${name}`, async (req, res) => {
      let isUsingCustomDocument = false;
      let layerName = null;
      let documentId = cachedExampleDocumentId;

      // If the client sent a previously used sharable id, we'll extract the
      // documentId and the layerId. If the document is no longer present, we
      // only recover from it
      const previousShareableId = req.body.previousDocumentId;
      if (previousShareableId) {
        const [
          previousDocumentId,
          previousLayerName,
          previousExampleHash
        ] = decodeShareableId(previousShareableId);

        // We can not rely on the `previousDocumentId` to see if the previous
        // sharable id was coming from a custom document since the cached
        // example document id is not stable across server restarts.
        if (previousExampleHash !== createExampleHash(name)) {
          isUsingCustomDocument = true;
        }

        documentId = previousDocumentId;
        layerName = previousLayerName;
      }

      // Verify that the documentID is still valid.
      if (documentId) {
        try {
          await PSPDFKit.documents.properties(documentId);
        } catch (error) {
          documentId = null;
        }
      }

      // Only re-upload the document when we have no valid id in our in-memory
      // cache.
      if (!documentId) {
        // In case we are using a custom document and it no longer exists, we
        // can not recover and thus error.
        if (isUsingCustomDocument) {
          console.error(
            `Tried to generate a JWT for document that no longer exists (${previousShareableId}).`
          );
          res.status(500).send("Document id no longer exists.");
          return;
        }

        const readStream = fs.createReadStream(filePath);
        const { document_id } = await PSPDFKit.documents.upload(
          readStream,
          `${name}.pdf`
        );
        documentId = document_id;
        cachedExampleDocumentId = document_id;
      }

      // Generate a unique layer name
      if (!layerName) {
        layerName = createLayerName();
      }

      res.json({
        documentId,
        id: encodeShareableId(documentId, layerName, name),
        jwt: createJwt(documentId, layerName)
      });
    });

    // Our Instant example accepts stable ids that can be encoded in the QR
    // code. Since this endpoint is called by our native apps as well, we're
    // implementing this as a custom route that redirects to the default Next.js
    // route on the web.
    //
    // Example:
    //
    //   GET /basic/42.z-N6-ejuV2T2j1lJwo8axw.-7e1 redirects to
    //       /basic?i=42.z-N6-ejuV2T2j1lJwo8axw.-7e1
    server.get(`/${name}/:shareableId`, (req, res) => {
      const { shareableId } = req.params;
      res.redirect(`/${name}?i=${shareableId}`);
    });

    // Serve all files in a `/static` folder within an example as static files.
    server.use(
      `/${name}/static`,
      express.static(
        path.join(__dirname, "..", "examples", fileSystemPath, "static")
      )
    );

    createAppEndpointForExample(server, name);
  });

  createAppEndpointForExample(server, "custom");

  // Every route that we do not manually match should be forwarded to Next.js
  // and handled there instead.
  // This will also take care of missing URLs and will return a proper 404
  // response in those cases.
  server.get("*", (req, res) => {
    return handle(req, res);
  });

  // Start listening on the predefined port. This will start the Express server.
  server.listen(port, err => {
    if (err) {
      throw err;
    }
    console.log(`> Ready on http://localhost:${port}`);
  });
});

function createAppEndpointForExample(server, name) {
  // Our PDF Viewer apps use this endpoint to access the instant API.
  // When the correct accept header is set, we redirect this URL to
  // provide the apps with the necessary JWT.
  server.get(`/${name}`, (req, res) => {
    if (req.headers.accept === "application/vnd.instant-example+json") {
      const id = req.query.i;

      if (typeof id === "undefined") {
        res.status(500).send("No Instant document ID found.");
      } else {
        res.redirect(`/api/instant/${id}`);
      }
    } else {
      handle(req, res);
    }
  });
}
