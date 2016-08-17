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
import { UserConnection } from '../connections/user';

export default {
  me: {
    type: UserType,
    resolve({ accessToken }, args, { user }) {
      if (!accessToken) throw new Error('Không có accessToken');
      return user;
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
