import Parse from 'parse/node';
import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

import {
  fromGlobalId,
  connectionArgs,
  connectionFromPromisedArray,
} from 'graphql-relay';

import OrderType from '../types/order';
import { OrderStatusEnum, ShopEnumType } from '../types/enumTypes';

import { OrderConnection } from '../connections/order';

export default {
  order: {
    type: OrderType,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve(root, { id }, { loaders }) {
      const { id: orderId } = fromGlobalId(id);
      return loaders.order.load(orderId);
    },
  },
  orders: {
    type: OrderConnection,
    args: {
      code: {
        type: GraphQLString,
      },
      shop: {
        type: ShopEnumType,
      },
      status: {
        type: OrderStatusEnum,
      },
      ...connectionArgs,
    },
    async resolve(root, args, { loaders, user }) {
      if (!user) throw new Error('Permission denied for action find on class Order.');
      const roles = await loaders.rolesByUser.load(user.id);
      const validRoles = roles.filter(role => {
        return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
      });

      if (validRoles.length === 0) throw new Error('Permission denied for action find on class Order.');
      if (validRoles.length === 1 && validRoles.indexOf('Sales') !== -1) {
        args.createdBy = user.id;
      }
      return connectionFromPromisedArray(loaders.orders.load(JSON.stringify(args)), {});
    },
  },
  ordersByCustomer: {
    type: OrderConnection,
    args: {
      code: {
        type: GraphQLString,
      },
      shop: {
        type: ShopEnumType,
      },
      status: {
        type: OrderStatusEnum,
      },
      ...connectionArgs,
    },
    resolve(root, args, { loaders, user }) {
      if (!user) throw new Error('Permission denied for action find on class Order.');
      args.customer = user.id;
      return connectionFromPromisedArray(loaders.orders.load(JSON.stringify(args)), {});
    },
  },
  ordersCount: {
    type: GraphQLInt,
    args: {
      status: {
        type: OrderStatusEnum,
      },
      shop: {
        type: ShopEnumType,
      },
      customer: {
        type: GraphQLID,
      },
      createdBy: {
        type: GraphQLID,
      },
    },
    resolve(root, args, { loaders }) {
      const Order = Parse.Object.extend('Order');
      const query = new Parse.Query(Order);
      Object.keys(args).forEach(async key => {
        if (key === 'customer' || key === 'createdBy') {
          const user = await loaders.user.load(key);
          query.equalTo(key, user);
        }
        query.equalTo(key, args[key]);
      });
      return query.count();
    },
  },
};
