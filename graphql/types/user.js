import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLList,
} from 'graphql';

import {
  globalIdField,
} from 'graphql-relay';

import {
  GraphQLEmail,
  GraphQLURL,
  GraphQLMobilePhone,
  GraphQLDateTime,
} from '@tranduchieu/graphql-custom-types';
import AddressType from './address';
import { ShopEnumType } from './enumTypes';

import RelayRegistry from '../relay/RelayRegistry';

// Resolver
export function userResolver(_, { id }, { loaders }) {
  return loaders.user.load(id);
}

const User = new GraphQLObjectType({
  name: 'User',
  description: 'User type',
  fields: () => ({
    id: globalIdField('User'),
    name: {
      type: GraphQLString,
      resolve(data) {
        return data.get('name');
      },
    },
    username: {
      type: GraphQLString,
      resolve(data) {
        return data.get('username');
      },
    },
    password: {
      type: GraphQLString,
    },
    roles: {
      type: new GraphQLList(GraphQLString),
      resolve({ id }, args, { loaders }) {
        return loaders.rolesByUser.load(id);
      },
    },
    email: {
      type: GraphQLEmail,
      resolve(data) {
        return data.get('email');
      },
    },
    emailVerified: {
      type: GraphQLBoolean,
      resolve(data) {
        return data.get('emailVerified');
      },
    },
    mobilePhone: {
      type: GraphQLMobilePhone,
      resolve(data) {
        return data.get('mobilePhone');
      },
    },
    mobilePhoneVerified: {
      type: GraphQLBoolean,
      resolve(data) {
        return data.get('mobilePhoneVerified');
      },
    },
    avatarUrl: {
      type: GraphQLURL,
      resolve(data) {
        return data.get('avatarUrl');
      },
    },
    addresses: {
      type: new GraphQLList(AddressType),
      args: {
        isDefault: {
          type: GraphQLBoolean,
        },
      },
      async resolve(data, { isDefault }, { loaders }) {
        const addressesByUser = await loaders.addressesByUser.load(data.id);
        if (isDefault) {
          return addressesByUser.filter(address => address.get('isDefault') === true);
        }
        if (isDefault === false) {
          return addressesByUser.filter(address => address.get('isDefault') === false);
        }

        return addressesByUser;
      },
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      resolve(data) {
        return data.get('tags');
      },
    },
    note: {
      type: GraphQLString,
      resolve(data, args, { user, roles }) {
        if (!user) return null;
        const validRoles = roles.filter(role => {
          return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
        });

        if (validRoles.length === 0) return null;
        return data.get('note');
      },
    },
    staffWorkplaces: {
      description: 'Những nơi nhân viên được sắp xếp làm việc',
      type: new GraphQLList(ShopEnumType),
      resolve(data, args, { user, roles }) {
        if (!user) return null;
        const validRoles = roles.filter(role => {
          return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
        });

        if (validRoles.length === 0) return null;
        return data.get('workplaces');
      },
    },
    staffWorkingIn: {
      description: 'Nhân viên đang làm việc tại',
      type: ShopEnumType,
      resolve(data, args, { user, roles }) {
        if (!user) return null;
        const validRoles = roles.filter(role => {
          return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
        });

        if (validRoles.length === 0) return null;
        return data.get('workingIn');
      },
    },
    createdAt: {
      type: GraphQLDateTime,
      resolve(data) {
        return data.get('createdAt');
      },
    },
    updatedAt: {
      type: GraphQLDateTime,
      resolve(data) {
        return data.get('updatedAt');
      },
    },
  }),
});

RelayRegistry.registerResolverForType(User, userResolver);
export default RelayRegistry.registerNodeType(User);

