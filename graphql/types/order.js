import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
} from 'graphql';

import { globalIdField } from 'graphql-relay';

import RelayRegistry from '../relay/RelayRegistry';

import { ShopEnumType, OrderStatusEnum } from './enumTypes';
import UserType from './user';
import ProductType from './product';
import AddressType from './address';

export function orderResolver(_, { id }, { loaders }) {
  return loaders.order.load(id);
}

const OrderLine = new GraphQLObjectType({
  name: 'OrderLine',
  description: 'OrderLine type',
  fields: {
    id: globalIdField('OrderLine'),
    product: {
      type: ProductType,
      resolve(data, args, { loaders }) {
        const { id } = data.get('product');
        return loaders.product.load(id);
      },
    },
    unitPrice: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('unitPrice');
      },
    },
    quantity: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('quantity');
      },
    },
    amount: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('amount');
      },
    },
    weight: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('weight');
      },
    },
  },
});

const Order = new GraphQLObjectType({
  name: 'Order',
  description: 'Order type',
  fields: {
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
      resolve(data, args, { loaders }) {
        const { id } = data.get('shipTo');
        return loaders.address.load(id);
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
      type: new GraphQLList(OrderLine),
      resolve({ id }, args, { loaders }) {
        return loaders.linesByOrder.load(id);
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
      async resolve(data, args, { loaders, user }) {
        console.log(user);
        if (!user) return null;
        const roles = await loaders.rolesByUser.load(user.id);
        const validRoles = roles.filter(role => {
          return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
        });

        if (validRoles.length === 0) return null;
        return data.get('note');
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
  },
});

RelayRegistry.registerResolverForType(Order, orderResolver);
export default RelayRegistry.registerNodeType(Order);
