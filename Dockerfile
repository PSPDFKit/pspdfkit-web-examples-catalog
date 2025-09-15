ARG BASE_IMAGE_REPO=node
ARG BASE_IMAGE_TAG=20.9.0-alpine3.18

FROM ${BASE_IMAGE_REPO}:${BASE_IMAGE_TAG} AS builder

# Install curl for the health check
RUN apk add --no-cache curl

# Create app directory
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app
WORKDIR /usr/src/app
USER node

# Copy optional Web SDK artifacts. Either provided via INTERNAL_WEB_ARTIFACT_PATH or fetched from NPM.
ARG WEB_SDK_VERSION
ARG INTERNAL_WEB_ARTIFACT_PATH
COPY --chown=node:node ${INTERNAL_WEB_ARTIFACT_PATH}* /tmp/

RUN if [ -z "${INTERNAL_WEB_ARTIFACT_PATH}" ]; then \
      echo "Fetching latest Web Artifact from NPM..." && \
      curl $(npm view @nutrient-sdk/viewer@${WEB_SDK_VERSION:-latest} dist.tarball) -o /tmp/nutrient-viewer.release.tar.gz && \
      mkdir -p /usr/src/app/_server/static/sdk && \
      tar xvfz /tmp/nutrient-viewer.release.tar.gz --strip-components=2 -C /usr/src/app/_server/static/sdk && \
      rm /tmp/nutrient-viewer.release.tar.gz; \
    else \
      echo "Using Web Artifact ${INTERNAL_WEB_ARTIFACT_PATH}..." && \
      mkdir -p /usr/src/app/_server/static/sdk &&  \
      tar xfz /tmp/${INTERNAL_WEB_ARTIFACT_PATH} --strip-components=1 -C /usr/src/app/_server/static/sdk && \
      rm /tmp/${INTERNAL_WEB_ARTIFACT_PATH}; \
    fi;

# Install app dependencies
COPY --chown=node:node package.json /usr/src/app/
RUN yarn install --frozen-lockfile

# Bundle app source
COPY --chown=node:node _server ./_server
COPY --chown=node:node examples ./examples
COPY --chown=node:node examples.config.js ./

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG SIGNING_SERVICE_URL
ENV SIGNING_SERVICE_URL=${SIGNING_SERVICE_URL}

ENV NODE_OPTIONS="--unhandled-rejections=warn --openssl-legacy-provider"

RUN WEB_SDK_LICENSE_KEY="WEB_SDK_LICENSE_KEY_PLACEHOLDER" \
    DOCUMENT_ENGINE_EXTERNAL_URL="DOCUMENT_ENGINE_EXTERNAL_URL_PLACEHOLDER" \
    WEB_SDK_LIB_SERVE_STRATEGY="WEB_SDK_LIB_SERVE_STRATEGY_PLACEHOLDER" \
    WEB_SDK_LIB_EXPLICIT_URL="WEB_SDK_LIB_EXPLICIT_URL_PLACEHOLDER" \
    NUTRIENT_AIA_URL="NUTRIENT_AIA_URL_PLACEHOLDER" \
    yarn build

RUN find . -type f -name "*-gnu" -exec rm -rf {} \;

FROM ${BASE_IMAGE_REPO}:${BASE_IMAGE_TAG} AS runner

RUN apk add --no-cache dumb-init

# Create app directory
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app

COPY --from=builder /usr/src/app/ /usr/src/app/

COPY container-entrypoint.sh /usr/src/app/container-entrypoint.sh
RUN chmod +x /usr/src/app/container-entrypoint.sh

WORKDIR /usr/src/app
USER node

RUN mkdir uploads

# For use in legacy orchestration systems
HEALTHCHECK --start-period=45s \
  CMD curl -f http://0.0.0.0:3000/ || exit 1

EXPOSE 3000

# Substitute variables
ENTRYPOINT [ "./container-entrypoint.sh" ]

# Use dumb-init to handle reaping zombie processes and forwarding signals
CMD ["_server/server.js"]
