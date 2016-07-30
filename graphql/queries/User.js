import Parse from 'parse/node';
import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import {
  fromGlobalId,
  connectionArgs,
  connectionFromPromisedArray,
} from 'graphql-relay';

import UserType from '../types/user';
import MeType from '../types/me';
import { UserConnection } from '../connections/user';

export default {
  me: {
    type: MeType,
    resolve({ accessToken }) {
      if (!accessToken) throw new Error('Không có accessToken');

      const query = new Parse.Query(Parse.Session);
      query.equalTo('sessionToken', accessToken);
      query.include('user.profile');
      return query.first()
        .then(result => {
          if (!result) throw new Error('không tìm thấy ');
          const user = result.get('user');
          user.set('expiresAt', result.get('expiresAt'));
          user.set('userSessionToken', result.get('sessionToken'));
          return user;
        })
        .catch(err => {
          throw err;
        });
    },
  },
  user: {
    type: UserType,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve(_, { id }, { loaders }) {
      const { id: userId } = fromGlobalId(id);

      return loaders.user.load(userId);
    },
  },
  users: {
    type: UserConnection,
    args: {
      username: {
        type: GraphQLString,
      },
      ...connectionArgs,
    },
    resolve(_, args, { loaders }) {
      return connectionFromPromisedArray(loaders.users.load(JSON.stringify(args)), {});
    },
  },
};
