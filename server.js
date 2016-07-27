/* eslint no-console:0 */
import express from 'express';
import cors from 'cors';
import Parse from 'parse/node';
import {
  ParseServer,
  S3Adapter,
}
from 'parse-server';
import parseDashboard from 'parse-dashboard';

import graphHTTP from 'express-graphql';
import Schema from './graphql/schema';
// import loaders from './graphql/loaders';
import config from './config';

const SERVER_PORT = process.env.PORT || 8080;
const SERVER_HOST = process.env.HOST || 'localhost';
const APP_ID = process.env.APP_ID || 'oss-f8-app-2016';
const MASTER_KEY = process.env.MASTER_KEY ||
                  '70c6093dba5a7e55968a1c7ad3dd3e5a74ef5cac';
const DATABASE_URI = config.DATABASE_URI || process.env.DATABASE_URI || 'mongodb://localhost:27017/dev';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const DASHBOARD_AUTH = process.env.DASHBOARD_AUTH || config.DASHBOARD_AUTH;

Parse.initialize(APP_ID);
Parse.serverURL = `http://localhost:${SERVER_PORT}/parse`;
Parse.masterKey = MASTER_KEY;
Parse.Cloud.useMasterKey();

// function getSchema() {
//   // if (!IS_DEVELOPMENT) {
//   //   return Schema;
//   // }

//   // delete require.cache[require.resolve('./graphql/schema.js')];
//   return require('./graphql/schema');
// }

const server = express();
server.use(cors());

server.use(
  '/parse',
  new ParseServer({
    databaseURI: DATABASE_URI,
    // cloud: path.resolve(__dirname, 'Cloud.js'),
    appId: APP_ID,
    masterKey: MASTER_KEY,
    fileKey: 'f33fc1a9-9ba9-4589-95ca-9976c0d52cd5',
    serverURL: `http://${SERVER_HOST}:${SERVER_PORT}/parse`,
    filesAdapter: new S3Adapter(
      config.S3_ACCESS_KEY,
      config.S3_SECRET_KEY,
      config.S3_BUCKET,
      { directAccess: true }
    ),
  })
);

if (IS_DEVELOPMENT) {
  let users;
  if (DASHBOARD_AUTH) {
    const [user, pass] = DASHBOARD_AUTH.split(':');
    users = [{
      user,
      pass,
    }];
  }
  server.use(
    '/dashboard',
    parseDashboard({
      apps: [{
        serverURL: '/parse',
        appId: APP_ID,
        masterKey: MASTER_KEY,
        appName: 'Parse Server',
      }],
      users,
    }, IS_DEVELOPMENT)
  );
}

function extractTokenFromHeader(headers) {
  if (headers == null || headers.authorization == null) return null;

  const authorization = headers.authorization;
  const authArr = authorization.split(' ');
  if (authArr.length !== 2) return null;

  // retrieve token
  const token = authArr[1];
  // 	if (token.length != TOKEN_LENGTH * 2) throw new Error('Token length is not the expected one');

  return token;
}

const loaders = require('./graphql/loaders');

server.use(
  '/graphql',
  graphHTTP(req => ({
    schema: Schema,
    pretty: true,
    graphiql: true,
    rootValue: {
      access_token: extractTokenFromHeader(req.headers) ||
                      req.query.access_token ||
                      null,
    },
    context: { loaders },
  }))
);

server.listen(SERVER_PORT, () => console.log(
  `Server is now running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${SERVER_PORT}`
));

