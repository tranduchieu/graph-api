import {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

import {
  globalIdField,
} from 'graphql-relay';

import RelayRegistry from '../relay/RelayRegistry';

// Resolver
export function accountResolver(_, { id }, { loaders }) {
  console.log('accountResolver', loaders);
  return {};
}

const MeType = new GraphQLObjectType({
  name: 'Me',
  description: 'Me type',
  fields: () => ({
    id: globalIdField('Me'),
    username: {
      type: GraphQLString,
      resolve(data) {
        return data.get('username');
      },
    },
    mobilePhone: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
    accessToken: {
      type: GraphQLString,
    },
    expires: {
      type: GraphQLInt,
    },
  }),
});

RelayRegistry.registerResolverForType(MeType, accountResolver);
export default RelayRegistry.registerNodeType(MeType);
