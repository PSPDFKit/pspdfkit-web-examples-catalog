require("dotenv").config({ path: "../../.env" });
const express = require("express");
const fs = require("fs");
const next = require("next");
const multer = require("multer");
const path = require("path");
const winston = require("winston");
const expressWinston = require("express-winston");

const DocumentWebServicesAPI = require("./lib/document-web-services-api");
const Nutrient = require("./lib/nutrient");
const { parseExamples } = require("./lib/parse-examples");
const {
  createJwt,
  createJwtForCover,
  createAIAssistantJwt,
  createJwtForProcessing,
} = require("./lib/jwt");
const {
  createExampleHash,
  createLayerName,
  decodeShareableId,
  encodeShareableId,
} = require("./lib/shareable-ids");

const port = parseInt(process.env.CATALOG_PORT) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: "_server" });
const handle = app.getRequestHandler();
const parsedExamples = parseExamples();
const {
  DOCUMENT_ENGINE_EXTERNAL_URL,
  DOCUMENT_ENGINE_INTERNAL_URL,
  UPLOAD_AUTH_USERNAME,
  UPLOAD_AUTH_PASSWORD,
} = process.env;

const logger = winston.createLogger({
  level: dev ? "none" : "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Write to file
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

const CONSTRUCTION_PLAN_DOCUMENT_ID = "construction-plan";

const decodedExampleNames = new Map(
  parseExamples().map(({ name }) => {
    return [createExampleHash(name), name];
  })
);

const { WEB_SDK_LICENSE_KEY, SIGNING_SERVICE_URL } = process.env;

if (!WEB_SDK_LICENSE_KEY) {
  console.warn(
    "The WEB_SDK_LICENSE_KEY environment variable is not set. Examples will run in trial mode."
  );
}

const upload = multer({ dest: "uploads/" });

const simpleHttpAuth = (req, res, next) => {
  // To protect the upload endpoint we check for username and password
  // via simple http auth, but only if these are set in the environment.
  if (UPLOAD_AUTH_USERNAME && UPLOAD_AUTH_PASSWORD) {
    const auth = {
      login: UPLOAD_AUTH_USERNAME,
      password: UPLOAD_AUTH_PASSWORD,
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

  server.enable("trust proxy");
  // Enable JSON body parsing
  server.use(express.json());

  // Add request logging middleware
  server.use(
    expressWinston.logger({
      winstonInstance: logger,
      meta: true,
      msg: "HTTP {{req.method}} {{req.url}}",
      expressFormat: true,
      colorize: dev,
      ignoredRoutes: ["/healthcheck"],
    })
  );

  // Add error logging middleware
  server.use(
    expressWinston.errorLogger({
      winstonInstance: logger,
    })
  );

  // We match the main entry point and redirect it to the first example in Server mode.
  server.get("/", (req, res) =>
    res.redirect(`/${parsedExamples[0].name}?mode=server`)
  );

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
        const response = await Nutrient.documents.upload(
          readStream,
          req.file.originalname
        );
        const documentId = response.document_id;
        const layerName = createLayerName();

        res.json({
          id: encodeShareableId(documentId, layerName),
        });
      } catch (error) {
        res.json({ error: error });
      } finally {
        // Remove the file after we've uploaded it
        fs.unlinkSync(req.file.path);
      }
    }
  );

  // Redirects to the cover image of the document with a new JWT token
  server.get("/custom/:id/cover", (req, res) => {
    [documentId, layerName, _exampleHash] = decodeShareableId(req.params.id);

    const jwt = createJwtForCover(documentId, layerName);
    const url = `${DOCUMENT_ENGINE_INTERNAL_URL}/documents/${documentId}/cover?width=1024&jwt=${jwt}`;

    console.log(url);

    res.redirect(url);
  });

  // This endpoint gets used for our PDFViewer apps to open an Instant Document.
  // The apps receive the URL by scanning the QR Code that we provide. We get
  // shareable-id and generate a JWT to access the document.
  const handleInstantEndpoint = (req, res) => {
    const [documentId, layerName, exampleHash] = decodeShareableId(
      req.params.id
    );
    const decodedExampleName = decodedExampleNames.get(exampleHash);

    // If we don't have an example name, it's a custom document and not part
    // of our predefined examples.
    let exampleUrl;

    if (decodedExampleName) {
      exampleUrl = `${req.protocol}://${req.get(
        "host"
      )}/${decodedExampleName}?inapp=true&i=${req.params.id}`;
    } else {
      exampleUrl = `${req.protocol}://${req.get("host")}/custom?inapp=true&i=${
        req.params.id
      }`;
    }

    const jwtParameters = req.body.jwtParameters || {};

    res.header("Access-Control-Allow-Origin", "*");
    res.json({
      encodedDocumentId: req.params.id,
      documentId: documentId,
      jwt: createJwt(documentId, layerName, jwtParameters),
      url: exampleUrl,
      serverUrl: DOCUMENT_ENGINE_EXTERNAL_URL,
    });
  };

  server.get("/api/instant/:id", handleInstantEndpoint);

  server.post("/api/instant/:id", handleInstantEndpoint);

  const handleExampleSessionEndpoint = async (
    req,
    res,
    documentId,
    documentFile,
    exampleName,
    customExampleName = ""
  ) => {
    const jwtParameters = req.body.jwtParameters || {};

    // Ensure the document exists.
    try {
      await Nutrient.documents.properties(documentId);
    } catch (_error) {
      // The document does not exist yet, we therefore upload it
      const filePath = path.join(__dirname, "public/static", documentFile);
      const readStream = fs.createReadStream(filePath);

      await Nutrient.documents.upload(readStream, documentId, documentId);
    }

    const layerName = createLayerName();
    const shareableId = encodeShareableId(documentId, layerName);

    res.header("Access-Control-Allow-Origin", "*");
    res.json({
      encodedDocumentId: shareableId,
      documentId: documentId,
      jwt: createJwt(documentId, layerName, jwtParameters),
      url: `${req.protocol}://${req.get(
        "host"
      )}/${exampleName}?i=${shareableId}${
        req.params.inapp ? "&inapp=true" : ""
      }${customExampleName ? `&example=${customExampleName}` : ""}`,
      serverUrl: DOCUMENT_ENGINE_EXTERNAL_URL,
    });
  };

  server.post("/api/collaboration-permissions", async (req, res) => {
    await handleExampleSessionEndpoint(
      req,
      res,
      "collaboration-permissions",
      "collaboration-permissions.pdf",
      "collaboration-permissions"
    );
  });

  server.post("/api/marketing-department-schedule", async (req, res) => {
    await handleExampleSessionEndpoint(
      req,
      res,
      "marketing-department-schedule",
      "marketing-department-schedule.pdf",
      "custom",
      "marketing-department-schedule"
    );
  });

  server.post("/api/instant-landing-page", async (req, res) => {
    await handleExampleSessionEndpoint(
      req,
      res,
      "instant-landing-page",
      "instant-landing-page.pdf",
      "custom",
      "instant-landing-page"
    );
  });

  server.post("/api/board-meeting", async (req, res) => {
    await handleExampleSessionEndpoint(
      req,
      res,
      "board-meeting",
      "board-meeting.pdf",
      "custom",
      "board-meeting"
    );
  });

  // The endpoint expects a JSON POST request with the required layer names
  // and returns a dictionary keyed by the layer name and the necessary metadata to
  // access the document on that layer.
  //
  // Testable with:
  //
  // curl http://localhost:3000/api/construction-plan \
  //   --header 'Content-type: application/json' \
  //   --data '{"layers": ["one", "two", "three"]}'
  server.post("/api/construction-plan", async (req, res) => {
    const layerNames = req.body.layers || [];
    const jwtParameters = req.body.jwtParameters || {};

    try {
      await Nutrient.documents.properties(CONSTRUCTION_PLAN_DOCUMENT_ID);
    } catch (_error) {
      // The document does not exist yet, we therefore upload it
      const filePath = path.join(
        __dirname,
        "public/static",
        "construction-plan.pdf"
      );
      const readStream = fs.createReadStream(filePath);

      await Nutrient.documents.upload(
        readStream,
        CONSTRUCTION_PLAN_DOCUMENT_ID,
        CONSTRUCTION_PLAN_DOCUMENT_ID
      );
    }

    const layerNamesWithMetadata = layerNames.reduce((acc, layerName) => {
      const shareableId = encodeShareableId(
        CONSTRUCTION_PLAN_DOCUMENT_ID,
        layerName
      );

      const metadata = {
        encodedDocumentId: shareableId,
        documentId: CONSTRUCTION_PLAN_DOCUMENT_ID,
        jwt: createJwt(CONSTRUCTION_PLAN_DOCUMENT_ID, layerName, jwtParameters),
        url: `${req.protocol}://${req.get("host")}/custom?i=${shareableId}${
          req.params.inapp ? "&inapp=true" : ""
        }&example=construction-plan`,
        serverUrl: DOCUMENT_ENGINE_EXTERNAL_URL,
      };

      acc[layerName] = metadata;

      return acc;
    }, {});

    res.header("Access-Control-Allow-Origin", "*");
    res.json(layerNamesWithMetadata);
  });

  // For every example, we add a couple of custom routes. These routes are used
  // to load the PDF and other example specific resources.
  parsedExamples.forEach(({ name, fileSystemPath, fileInfo }) => {
    const dirname = path.join(__dirname, "..", "examples", fileSystemPath);

    const filePath = path.join(dirname, fileInfo.name);

    const fileSize = fs.statSync(filePath).size;

    // This route is used to access the raw PDF and is necessary to load the
    // standalone examples.
    // We explicitly set a cache control to 24 hours here since we want to avoid
    // re-fetching this PDF whenever we reload the example.
    server.get(`/${name}/${fileInfo.name}`, (req, res) => {
      res.writeHead(200, {
        "Content-Type": fileInfo.mimeType,
        "Content-Length": fileSize,
        "Cache-Control": "public, max-age=86400",
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
    // have to re-upload the document. Nutrient Document Engine is smart enough to notice
    // that the same PDF is already stored and won't require additional storage,
    // so this is acceptable.
    //
    // If, for any reason, the documentId is no longer valid (which usually
    // means that Document Engine was wiped or the document was manually
    // deleted), we also clear our local cache and re-upload.
    //
    // @see https://www.nutrient.io/api/reference/document-engine/upstream/#tag/Documents
    // @see https://www.nutrient.io/guides/document-engine/instant-synchronization/instant-layers/
    let cachedExampleDocumentId = null;

    server.post(`/server-document/${name}`, async (req, res) => {
      let isUsingCustomDocument = false;
      let layerName = null;
      let documentId = cachedExampleDocumentId;
      // If the client sent a previously used sharable id, we'll extract the
      // documentId and the layerId. If the document is no longer present, we
      // only recover from it
      const previousShareableId = req.body.previousDocumentId;
      const jwtParameters = req.body.jwtParameters;

      if (previousShareableId) {
        const [previousDocumentId, previousLayerName, previousExampleHash] =
          decodeShareableId(previousShareableId);

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
          await Nutrient.documents.properties(documentId);
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

        let uploadResponse;

        try {
          uploadResponse = await Nutrient.documents.upload(
            readStream,
            fileInfo.name
          );

          if (!uploadResponse) {
            throw new Error("Upload response is empty.");
          }

          documentId = uploadResponse.document_id;
        } catch (error) {
          res.status(500).send(error.message);

          return;
        }

        cachedExampleDocumentId = documentId;
      }

      // Generate a unique layer name
      if (!layerName) {
        layerName = createLayerName();
      }

      res.json({
        documentId,
        id: encodeShareableId(documentId, layerName, name),
        jwt: createJwt(documentId, layerName, jwtParameters),
        aiaJwt: createAIAssistantJwt(),
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

      res.redirect(`/${name}?inapp=true&i=${shareableId}`);
    });

    // This endpoint generates a valid JWT for our AI Assistant, used
    // when deployed standalone (without a Document Engine dependency).
    server.post("/generate-aia-jwt", (req, res) => {
      res.json({
        jwt: createAIAssistantJwt(),
      });
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

  // Serve the Apple App Site Association File to enable Universal Links in
  // PDF Viewer for iOS.
  server.get("/.well-known/apple-app-site-association", (req, res) => {
    res.json(require("./public/static/apple-app-site-association.json"));
  });

  server.get("/api/get-signing-service-certificates", async (req, res) => {
    try {
      const response = await fetch(SIGNING_SERVICE_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_certificates",
          signing_token: "user-1-with-rights",
        }),
      });

      res.json(await response.json());
    } catch (error) {
      res.status(500).send("Could not fetch certificates.");
    }
  });

  server.post("/api/sign-via-service", async (req, res) => {
    try {
      const response = await fetch(SIGNING_SERVICE_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "sign",
          data_to_be_signed: req.body.dataToBeSigned,
          hash_algorithm: req.body.hashAlgorithm || "sha256",
          signature_type: req.body.signatureType || "cades",
          signing_token: "user-1-with-rights",
        }),
      });

      res.send(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      return res.status(500).send("Could not perform sign request.");
    }
  });

  server.get("/api/get-certificates", async (req, res) => {
    try {
      const response =
        req.query.backend === "dws"
          ? await DocumentWebServicesAPI.signatures.getCertificates()
          : await Nutrient.signatures.getCertificates({
              signingToken: req.body.signingToken || "user-1-with-rights",
            });

      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).send("Could not fetch certificates.");
    }
  });

  server.post("/api/create-auth-token", async (req, res) => {
    try {
      const allowedOperations = req.body.allowedOperations || undefined;
      const allowedOrigins = [req.headers["origin"]];

      const jwt =
        req.query.backend === "dws"
          ? await DocumentWebServicesAPI.auth.createToken({
              allowedOperations,
              allowedOrigins,
            })
          : createJwtForProcessing({
              allowed_operations: allowedOperations,
              server_url:
                DOCUMENT_ENGINE_EXTERNAL_URL || DOCUMENT_ENGINE_INTERNAL_URL,
            });

      res.json({
        jwt,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Could not create auth token.");
    }
  });

  server.get("/healthcheck", (req, res) => {
    res.send("OK");
  });

  // Every route that we do not manually match should be forwarded to Next.js
  // and handled there instead.
  // This will also take care of missing URLs and will return a proper 404
  // response in those cases.
  server.get("*", (req, res) => {
    return handle(req, res);
  });

  // Start listening on the predefined port. This will start the Express server.
  server.listen(port, (err) => {
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
