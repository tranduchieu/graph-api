import {
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';

import {
  fromGlobalId,
  connectionArgs,
  connectionFromPromisedArray,
} from 'graphql-relay';

import UserType from '../types/user';
import { UserConnection } from '../connections/user';

export default {
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
      ...connectionArgs,
    },
    resolve(_, args, { loaders }) {
      const loaderKey = args.username ? JSON.stringify(args) : 'allUsers';

      return connectionFromPromisedArray(loaders.users.load(loaderKey), args);
    },
  },
};
