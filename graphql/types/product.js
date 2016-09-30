import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql';

import { GraphQLURL, GraphQLDateTime } from '@tranduchieu/graphql-custom-types';

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
    name: {
      type: GraphQLString,
      resolve(data) {
        return data.get('data');
      },
    },
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

        if (images.length === 0) return images;

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
    additionalPrices: {
      type: new GraphQLList(GraphQLInt),
      resolve(data) {
        return data.get('additionalPrices');
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
    createdAt: {
      type: GraphQLDateTime,
      resolve(data) {
        return data.get('createdAt');
      },
    },
    createdBy: {
      type: UserType,
      resolve(data, args, { loaders }) {
        const { id } = data.get('createdBy');
        return loaders.user.load(id);
      },
    },
    updatedAt: {
      type: GraphQLDateTime,
      resolve(data) {
        return data.get('updatedAt');
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
