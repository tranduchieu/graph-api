import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql';

import { GraphQLURL } from '@tranduchieu/graphql-custom-types';

import {
  globalIdField,
} from 'graphql-relay';

import RelayRegistry from '../relay/RelayRegistry';

import UserType from './user';

import {
  ShopEnumType,
  ProductStatusEnum,
} from './enumTypes';

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
      type: ShopEnumType,
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
      type: ProductStatusEnum,
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
      type: new GraphQLList(GraphQLURL),
      args: {
        size: {
          type: GraphQLString,
          defaultValue: 'main',
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
      resolve(data, args, { loaders }) {
        const { id } = data.get('createdBy');
        return loaders.user.load(id);
      },
    },
    updatedBy: {
      type: UserType,
      resolve(data, args, { loaders }) {
        const { id } = data.get('updatedBy');
        return loaders.user.load(id);
      },
    },
  }),
});

RelayRegistry.registerResolverForType(Product, productResolver);
export default RelayRegistry.registerNodeType(Product);
