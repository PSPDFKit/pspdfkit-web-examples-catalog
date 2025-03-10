FROM node:20.9.0-alpine3.18

# Install curl for the health check
RUN apk add --no-cache curl

# Create app directory
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app
USER node

WORKDIR /usr/src/app

# Copy optional Web SDK artifacts. Either provided via INTERNAL_WEB_ARTIFACT_PATH or fetched from NPM.
ARG INTERNAL_WEB_ARTIFACT_PATH
COPY --chown=node:node ${INTERNAL_WEB_ARTIFACT_PATH}* /tmp/

ARG WEB_SDK_VERSION

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
COPY --chown=node:node . /usr/src/app

HEALTHCHECK --start-period=45s \
  CMD curl -f http://0.0.0.0:3000/ || exit 1

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

EXPOSE 3000

RUN chmod +x ./container-entrypoint.sh
ENTRYPOINT [ "./container-entrypoint.sh" ]

CMD ["_server/server.js"]
