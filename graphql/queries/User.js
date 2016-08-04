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
    resolve({ accessToken }, args, { me }) {
      if (!accessToken) throw new Error('Không có accessToken');
      return me;
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
