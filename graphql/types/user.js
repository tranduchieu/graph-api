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
} from '@tranduchieu/graphql-custom-types';

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
    address: {
      type: GraphQLString,
      resolve(data) {
        return data.get('address');
      },
    },
    district: {
      type: GraphQLString,
      resolve(data) {
        return data.get('district');
      },
    },
    province: {
      type: GraphQLString,
      resolve(data) {
        return data.get('province');
      },
    },
  }),
});

RelayRegistry.registerResolverForType(User, userResolver);
export default RelayRegistry.registerNodeType(User);

