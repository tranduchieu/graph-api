import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
} from 'graphql';

import { globalIdField } from 'graphql-relay';
import { GraphQLDateTime } from '@tranduchieu/graphql-custom-types';

import { nodeInterface } from '../relay/RelayNode';
import RelayRegistry from '../relay/RelayRegistry';

import { ShopEnumType, OrderStatusEnum } from './enumTypes';
import UserType from './user';
import { AddressType } from './address';
import { OrderLineType } from './orderLine';

export function orderResolver(_, { id }, { loaders }) {
  return loaders.order.load(id);
}

const Order = new GraphQLObjectType({
  name: 'Order',
  description: 'Order type',
  fields: () => ({
    id: globalIdField('Order'),
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
    customer: {
      type: UserType,
      resolve(data, args, { loaders }) {
        const { id } = data.get('customer');
        return loaders.user.load(id);
      },
    },
    shippingAddress: {
      type: AddressType,
      resolve(data) {
        return data.get('shippingAddress');
      },
    },
    shippingCost: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('shippingCost');
      },
    },
    shippingDays: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('shippingDays');
      },
    },
    status: {
      type: OrderStatusEnum,
      resolve(data) {
        return data.get('status');
      },
    },
    lines: {
      type: new GraphQLList(OrderLineType),
      resolve(data) {
        return data.get('lines');
      },
    },
    subTotal: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('subTotal');
      },
    },
    percentageDiscount: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('percentageDiscount');
      },
    },
    fixedDiscount: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('fixedDiscount');
      },
    },
    totalDiscounts: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('totalDiscounts');
      },
    },
    total: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('total');
      },
    },
    totalWeight: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('totalWeight');
      },
    },
    note: {
      type: GraphQLString,
      resolve(data, args, { user, roles }) {
        if (!user) return null;
        const validRoles = roles.filter(role => {
          return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
        });

        if (validRoles.length === 0) return null;
        return data.get('note');
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
    viewer: {
      type: UserType,
      resolve(root, args, { user }) {
        return user || {};
      },
    },
  }),
  interfaces: [nodeInterface],
});

RelayRegistry.registerResolverForType(Order, orderResolver);
export default RelayRegistry.registerNodeType(Order);
