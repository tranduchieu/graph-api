# node Current release
FROM node:wheezy

MAINTAINER Hieu Tran <hieu.tranduc@gmail.com>

# use nodemon for development
RUN npm install --global nodemon

# use cached layer for node modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/src && cp -a /tmp/node_modules /usr/src/

# add project files
WORKDIR /usr/src
ADD . /usr/src

EXPOSE 8080

CMD ["nodemon", "-L", "/usr/src/bin/www"]