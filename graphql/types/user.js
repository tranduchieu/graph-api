import {
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

import {
  globalIdField,
} from 'graphql-relay';

import RelayRegistry from '../relay/RelayRegistry';

import ProfileType from './profile';

// Resolver
export function userResolver(_, { id }, { loaders }) {
  return loaders.user.load(id);
}

const User = new GraphQLObjectType({
  name: 'User',
  description: 'User type',
  fields: () => ({
    id: globalIdField('User'),
    username: {
      type: GraphQLString,
      resolve(data) {
        return data.get('username');
      },
    },
    password: {
      type: GraphQLString,
    },
    profile: {
      type: ProfileType,
      resolve(data) {
        return data.profile;
      },
    },
  }),
});

RelayRegistry.registerResolverForType(User, userResolver);
export default RelayRegistry.registerNodeType(User);

