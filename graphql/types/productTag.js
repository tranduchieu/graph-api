import {
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

import {
  globalIdField,
} from 'graphql-relay';

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
    image: {
      type: GraphQLString,
      resolve(data) {
        return data.get('image');
      },
    },
  }),
});

RelayRegistry.registerResolverForType(ProductTag, productTagResolver);
export default RelayRegistry.registerNodeType(ProductTag);
