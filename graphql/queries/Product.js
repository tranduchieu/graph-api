import Parse from 'parse/node';
import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
} from 'graphql';

import {
  fromGlobalId,
  connectionArgs,
  connectionFromPromisedArray,
} from 'graphql-relay';

import ProductType from '../types/product';
import {
  ShopEnumType,
  ProductStatusEnum,
} from '../types/enumTypes';
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
      return loaders.product.load(productId);
    },
  },
  products: {
    type: ProductConnection,
    args: {
      code: {
        type: GraphQLString,
      },
      shop: {
        type: ShopEnumType,
      },
      status: {
        type: ProductStatusEnum,
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
  productsCount: {
    type: GraphQLInt,
    args: {
      status: {
        type: ProductStatusEnum,
      },
      shop: {
        type: ShopEnumType,
      },
    },
    resolve(root, args) {
      const Product = Parse.Object.extend('Product');
      const query = new Parse.Query(Product);
      Object.keys(args).forEach(key => {
        query.equalTo(key, args[key]);
      });
      return query.count();
    },
  },
};
