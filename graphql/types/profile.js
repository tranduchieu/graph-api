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
    },
    email: {
      type: GraphQLString,
    },
    mobilePhone: {
      type: GraphQLString,
    },
    address: {
      type: GraphQLString,
    },
    district: {
      type: GraphQLString,
    },
    province: {
      type: GraphQLString,
    },
  }),
});

RelayRegistry.registerResolverForType(Profile, profileResolver);
export default RelayRegistry.registerNodeType(Profile);
