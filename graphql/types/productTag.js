import {
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

import {
  globalIdField,
} from 'graphql-relay';

import { GraphQLDateTime } from '@tranduchieu/graphql-custom-types';

import RelayRegistry from '../relay/RelayRegistry';

export function productTagResolver(_, { id }, { loaders }) {
  return loaders.productTag.load(id);
}

const ProductTag = new GraphQLObjectType({
  name: 'ProductTag',
  description: 'Product tag type',
  fields: () => ({
    id: globalIdField('Tag'),
    name: {
      type: GraphQLString,
      resolve(data) {
        return data.get('name');
      },
    },
    description: {
      type: GraphQLString,
      resolve(data) {
        return data.get('description');
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

RelayRegistry.registerResolverForType(ProductTag, productTagResolver);
export default RelayRegistry.registerNodeType(ProductTag);
