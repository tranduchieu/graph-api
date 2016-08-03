import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
} from 'graphql';

import {
  fromGlobalId,
  connectionArgs,
  connectionFromPromisedArray,
} from 'graphql-relay';

import ProductType from '../types/product';
import { ProductConnection } from '../connections/product';

export default {
  product: {
    type: ProductType,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve(root, { id }, { loaders }) {
      const { id: productId } = fromGlobalId(id);
      console.log(productId);
      return loaders.product.load(productId);
    },
  },
  products: {
    type: ProductConnection,
    args: {
      sku: {
        type: GraphQLString,
      },
      boxes: {
        type: new GraphQLList(GraphQLString),
      },
      ...connectionArgs,
    },
    resolve(root, args, { loaders }) {
      return connectionFromPromisedArray(loaders.products.load(JSON.stringify(args)), {});
    },
  },
};
