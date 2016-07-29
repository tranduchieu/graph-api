import {
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

import { globalIdField } from 'graphql-relay';

import RelayRegistry from '../relay/RelayRegistry';

// Resolver
export function profileResolver(_, { id }, { loaders }) {
  return loaders.profile.load(id);
}
const Profile = new GraphQLObjectType({
  name: 'Profile',
  description: 'Profile type',
  fields: () => ({
    id: globalIdField('Profile'),
    name: {
      type: GraphQLString,
      resolve(data) {
        return data.get('name');
      },
    },
    email: {
      type: GraphQLString,
      resolve(data) {
        return data.get('email');
      },
    },
    mobilePhone: {
      type: GraphQLString,
      resolve(data) {
        return data.get('mobilePhone');
      },
    },
    avatarUrl: {
      type: GraphQLString,
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

RelayRegistry.registerResolverForType(Profile, profileResolver);
export default RelayRegistry.registerNodeType(Profile);
