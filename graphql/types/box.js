import {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
} from 'graphql';

import {
  globalIdField,
} from 'graphql-relay';

import RelayRegistry from '../relay/RelayRegistry';

export function boxResolver(_, { id }, { loaders }) {
  return loaders.box.load(id);
}

const Box = new GraphQLObjectType({
  name: 'Box',
  description: 'Box type',
  fields: () => ({
    id: globalIdField('Box'),
    name: {
      type: GraphQLString,
      resolve(data) {
        return data.get('name');
      },
    },
    type: {
      type: GraphQLString,
      resolve(data) {
        return data.get('type');
      },
    },
    position: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('position');
      },
    },
    description: {
      type: GraphQLString,
      resolve(data) {
        return data.get('description');
      },
    },
    coverImageSrc: {
      type: GraphQLString,
      resolve(data) {
        return data.get('coverImageSrc');
      },
    },
  }),
});

RelayRegistry.registerResolverForType(Box, boxResolver);
export default RelayRegistry.registerNodeType(Box);
