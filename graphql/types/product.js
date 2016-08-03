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

import UserType from './user';

export function productResolver(_, { id }, { loaders }) {
  return loaders.product.load(id);
}

const ProductAdditionalPropertiesType = new GraphQLObjectType({
  name: 'ProductAdditionalProperties',
  description: 'Product Additional Properties type',
  fields: () => ({
    name: {
      type: GraphQLString,
    },
    value: {
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
    sku: {
      type: GraphQLString,
      resolve(data) {
        return data.get('sku');
      },
    },
    shop: {
      type: GraphQLString,
      resolve(data) {
        return data.get('shop');
      },
    },
    boxes: {
      type: new GraphQLList(GraphQLString),
      resolve(data) {
        return data.get('boxes');
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
      type: new GraphQLList(GraphQLString),
      args: {
        size: {
          type: GraphQLString,
        },
      },
      resolve(data, { size }) {
        const images = data.get('images');
        const imagesFilter = images.map(imagesObj => {
          return imagesObj[size];
        });
        return imagesFilter;
      },
    },
    tags: {
      type: new GraphQLList(GraphQLString),
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
    weight: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('weight');
      },
    },
    additionalProperties: {
      type: new GraphQLList(ProductAdditionalPropertiesType),
      resolve(data) {
        return data.get('additionalProperties');
      },
    },
    createdBy: {
      type: UserType,
      resolve(data) {
        return data.get('createdBy');
      },
    },
    updatedBy: {
      type: UserType,
      resolve(data) {
        return data.get('updatedBy');
      },
    },
  }),
});

RelayRegistry.registerResolverForType(Product, productResolver);
export default RelayRegistry.registerNodeType(Product);
