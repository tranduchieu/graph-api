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

import latenize from '../../services/latenize';

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
    resolve(_, { id }, { loaders, user, roles }) {
      const { id: userId } = fromGlobalId(id);

      return loaders.user.load(userId)
      .then(userObj => {
        if (!userObj) throw new Error('User not found');

        // Check quyen admin
        const validRoles = roles.filter(role => {
          return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
        });

        if (validRoles.length === 0 &&
            !(userObj.get('ACL').permissionsById[user.id] || {}).read) {
          throw new Error('Permission denied for action get this User.');
        }

        return userObj;
      });
    },
  },
  users: {
    type: UserConnection,
    args: {
      username: {
        type: GraphQLString,
      },
      nameStartsWith: {
        type: GraphQLString,
      },
      mobilePhoneStartsWith: {
        type: GraphQLString,
      },
      ...connectionArgs,
    },
    resolve(_, args, { loaders, user, roles }) {
      if (!user) throw new Error('Guest không có quyền query Users');
      // Check quyền admin
      const validRoles = roles.filter(role => {
        return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
      });
      if (validRoles.length === 0) throw new Error('Permission denied for action find on class User.');

      if (args.nameStartsWith) args.nameStartsWith = latenize(args.nameStartsWith).toLowerCase();

      return connectionFromPromisedArray(loaders.users.load(JSON.stringify(args)), {});
    },
  },
};
