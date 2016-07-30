# node Current release
FROM node:latest

MAINTAINER Hieu Tran <hieu.tranduc@gmail.com>

# Install Node global packages
RUN npm install -g nodemon babel-cli

# Create app directory
RUN mkdir -p /usr/src
WORKDIR /usr/src

# Install app dependencies
COPY package.json /usr/src
RUN npm install

# Bundle app source
COPY . /usr/src

EXPOSE 8080

CMD ["nodemon", "-L", "--exec", "babel-node", "server.js"]