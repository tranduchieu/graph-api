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
      query.include('user');
      return query.first()
      .then(result => {
        return result.get('user');
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
      const loaderKey = args.username ? JSON.stringify(args) : 'allUsers';

      return connectionFromPromisedArray(loaders.users.load(loaderKey), args);
    },
  },
};
