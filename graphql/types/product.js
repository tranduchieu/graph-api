import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql';

import {
  globalIdField,
} from 'graphql-relay';

import RelayRegistry from '../relay/RelayRegistry';

import ProductTagType from './productTag';
import UserType from './user';

export function productResolver(_, { id }, { loaders }) {
  return loaders.product.load(id);
}

const ProductImageType = new GraphQLObjectType({
  name: 'Product Image',
  description: 'Product image type',
  fields: () => ({
    position: {
      type: GraphQLInt,
    },
    largeSizeSrc: {
      type: GraphQLString,
    },
    mediumSizeSrc: {
      type: GraphQLString,
    },
    smallSizeSrc: {
      type: GraphQLString,
    },
  }),
});

const Product = new GraphQLObjectType({
  name: 'Product',
  description: 'Product type',
  fields: () => ({
    id: globalIdField('Product'),
    description: {
      type: GraphQLString,
      resolve(data) {
        return data.get('description');
      },
    },
    code: {
      type: GraphQLString,
      resolve(data) {
        return data.get('code');
      },
    },
    shop: {
      type: GraphQLString,
      resolve(data) {
        return data.get('shop');
      },
    },
    status: {
      // ['draft', 'availableInStore', 'availableInOnline', 'availableAll',
      // 'suspended', 'sold', 'closed']
      type: GraphQLString,
      resolve(data) {
        return data.get('status');
      },
    },
    featured: {
      type: GraphQLBoolean,
      resolve(data) {
        return data.get('featured');
      },
    },
    images: {
      type: new GraphQLList(ProductImageType),
      resolve(data) {
        return data.get('images');
      },
    },
    tags: {
      type: new GraphQLList(ProductTagType),
      resolve(data) {
        return data.get('tags');
      },
    },
    price: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('price');
      },
    },
    salePrice: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('salePrice');
      },
    },
    createdBy: {
      type: UserType,
      resolve(data) {
        return data.get('createdBy');
      },
    },
  }),
});

RelayRegistry.getResolverForNodeType(Product, productResolver);
export default RelayRegistry.registerNodeType(Product);
