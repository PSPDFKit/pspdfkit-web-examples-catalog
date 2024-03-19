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
      curl $(npm view pspdfkit@${WEB_SDK_VERSION:-latest} dist.tarball) -o /tmp/pspdfkit.release.tar.gz && \
      mkdir -p /usr/src/app/_server/static/sdk && \
      tar xvfz /tmp/pspdfkit.release.tar.gz --strip-components=2 -C /usr/src/app/_server/static/sdk && \
      rm /tmp/pspdfkit.release.tar.gz; \
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

ARG NODE_ENV=development
ENV NODE_ENV ${NODE_ENV}
EXPOSE 3000
CMD [ "yarn", "start" ]
