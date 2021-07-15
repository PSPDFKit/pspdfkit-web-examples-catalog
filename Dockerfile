FROM node:12.20-alpine3.10

# Install curl for the health check
RUN apk add --no-cache curl

# Create app directory
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app
USER node

WORKDIR /usr/src/app

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
