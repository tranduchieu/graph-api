import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLBoolean,
} from 'graphql';

import {
  globalIdField,
} from 'graphql-relay';

import RelayRegistry from '../relay/RelayRegistry';

import {
  EmailType,
  MobilePhoneType,
  UrlType,
} from './customTypes';

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
    isCustomerOnly: {
      type: GraphQLBoolean,
      resolve(data) {
        return data.get('isCustomerOnly');
      },
    },
    email: {
      type: EmailType,
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
      type: MobilePhoneType,
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
      type: UrlType,
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

