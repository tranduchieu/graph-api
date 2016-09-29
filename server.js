/* eslint no-console:0 */
import path from 'path';
import express from 'express';
import cors from 'cors';
import Parse from 'parse/node';
import {
  ParseServer,
}
from 'parse-server';
import ParseDashboard from 'parse-dashboard';

import graphHTTP from 'express-graphql';
import Schema from './graphql/schema';
// import loaders from './graphql/loaders';
import S3Adapter from './services/myS3Adapter';

const SERVER_PORT = process.env.PORT || 8080;
const SERVER_HOST = process.env.HOST || 'localhost';
const APP_ID = process.env.APP_ID || 'oss-f8-app-2016';
const MASTER_KEY = process.env.MASTER_KEY ||
                  '70c6093dba5a7e55968a1c7ad3dd3e5a74ef5cac';
const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/dev';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const DASHBOARD_AUTH = process.env.DASHBOARD_AUTH;
const SESSION_LENGTH = process.env.SESSION_LENGTH || 2592000;

const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'YOUR_S3_ACCESS_KEY';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'YOUR_S3_SECRET_KEY';
const S3_BUCKET = process.env.S3_BUCKET || 'YOUR_S3_BUCKET';

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
    cloud: path.resolve(__dirname, 'cloud'),
    appId: APP_ID,
    masterKey: MASTER_KEY,
    fileKey: 'f33fc1a9-9ba9-4589-95ca-9976c0d52cd5',
    serverURL: `http://${SERVER_HOST}:${SERVER_PORT}/parse`,
    facebookAppIds: ['124825337927566'],
    sessionLength: SESSION_LENGTH,
    filesAdapter: new S3Adapter(
      S3_ACCESS_KEY,
      S3_SECRET_KEY,
      S3_BUCKET,
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
    new ParseDashboard({
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
  graphHTTP(async (req) => {
    const accessToken = extractTokenFromHeader(req.headers) ||
                        req.query.accessToken ||
                        null;
    const masterkey = req.headers.masterkey || req.query.masterkey || null;
    let useMasterKey = false;
    if (masterkey === MASTER_KEY) useMasterKey = true;

    let user;
    if (!accessToken) {
      user = null;
    } else {
      const query = new Parse.Query('_Session');
      query.equalTo('sessionToken', accessToken);
      query.include('user');
      user = await query.first({ useMasterKey: true })
      .then(session => {
        if (!session) throw new Error('invalid session token');
        return session.get('user');
      });
    }

    let roles = [];
    if (user) {
      roles = await loaders.rolesByUser.load(user.id);
    }

    return {
      schema: Schema,
      pretty: true,
      graphiql: true,
      rootValue: { accessToken },
      context: { loaders, accessToken, useMasterKey, user, roles },
    };
  })
);

server.listen(SERVER_PORT, () => console.log(
  `Server is now running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${SERVER_PORT}`
));

if (IS_DEVELOPMENT) {
  require('./parse-example');
}

