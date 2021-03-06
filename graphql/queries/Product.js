import Parse from 'parse/node';
import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
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
    resolve(root, { id }, { loaders, roles }) {
      const { id: productId } = fromGlobalId(id);
      return loaders.product.load(productId)
      .then(productObj => {
        if (!productObj) throw new Error('Product not found');

        const validRoles = roles.filter(role => {
          return ['Boss', 'Administrator', 'Manager', 'WarehouseManager'].indexOf(role) !== -1;
        });

        if (validRoles.length === 0 &&
            (productObj.get('status') === 'draft' ||
            productObj.get('status') === 'closed')) {
          throw new Error('Permission denied for action get this Product.');
        }

        return productObj;
      });
    },
  },
  products: {
    type: ProductConnection,
    args: {
      code: {
        type: GraphQLString,
      },
      shop: {
        type: new GraphQLList(ShopEnumType),
      },
      status: {
        type: new GraphQLList(ProductStatusEnum),
      },
      isMultipleProduct: {
        type: GraphQLBoolean,
        defaultValue: false,
      },
      boxes: {
        type: new GraphQLList(GraphQLString),
      },
      skip: {
        type: GraphQLInt,
        defaultValue: 0,
      },
      limit: {
        type: GraphQLInt,
        defaultValue: 20,
      },
      ...connectionArgs,
    },
    resolve(root, args, { loaders, roles }) {
      const validRoles = roles.filter(role => {
        return ['Boss', 'Administrator', 'Manager', 'WarehouseManager'].indexOf(role) !== -1;
      });

      if (validRoles.length === 0 &&
          args.status &&
          (args.status.indexOf('draft') !== -1 ||
          args.status.indexOf('closed') !== -1)) {
        throw new Error('Permission denied for action find Products status is Draft or Closed.');
      }

      if (validRoles.length === 0 &&
          (!args.status || args.status.length === 0)) {
        args.status = ['availableInStore', 'availableInOnline', 'availableInAll', 'suspended', 'sold'];
      }

      if (args.code) args.code = args.code.toLowerCase();

      return connectionFromPromisedArray(loaders.products.load(JSON.stringify(args)), {});
    },
  },
  productsCount: {
    type: GraphQLInt,
    args: {
      status: {
        type: new GraphQLList(ProductStatusEnum),
      },
      shop: {
        type: new GraphQLList(ShopEnumType),
      },
    },
    resolve(root, args) {
      const Product = Parse.Object.extend('Product');
      const query = new Parse.Query(Product);
      Object.keys(args).forEach(key => {
        query.containedIn(key, args[key]);
      });
      return query.count({ useMasterKey: true });
    },
  },
};
