# node Current release
FROM node:latest

MAINTAINER Hieu Tran <hieu.tranduc@gmail.com>

# Install Node global packages
RUN npm install -g yarn pm2 babel-cli

# Create app directory
RUN mkdir -p /usr/src
WORKDIR /usr/src

# Install app dependencies
COPY package.json /usr/src
RUN yarn install

# Bundle app source
COPY . /usr/src

# Clean dist folder
RUN rm -rf dist && mkdir dist

# Build
RUN babel-node --presets es2015,stage-0 ./scripts/updateSchema.js
RUN babel . --ignore node_modules,test,flow-typed,interfaces --out-dir dist

VOLUME /data/db /data/backup

EXPOSE 8080

# CMD ["nodemon", "-L", "--exec", "babel-node", "server.js"]
CMD ["pm2-docker", "start", "process.config.js", "--env", "${APP_ENV}"]