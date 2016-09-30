import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';

import {
  fromGlobalId,
  mutationWithClientMutationId,
  offsetToCursor,
} from 'graphql-relay';

import { omit } from 'lodash';
import Parse from 'parse/node';

import OrderType from '../types/order';
import { OrderLineInputType } from '../types/orderLine';
import {
  ShopEnumType,
  OrderStatusEnum,
} from '../types/enumTypes';

import { OrderEdge } from '../connections/order';
import ViewerQueries from '../queries/Viewer';
import { AddressInputType } from '../types/address';

const OrderCreateMutation = mutationWithClientMutationId({
  name: 'OrderCreate',
  inputFields: {
    code: {
      type: new GraphQLNonNull(GraphQLString),
    },
    shop: {
      type: new GraphQLNonNull(ShopEnumType),
    },
    customer: {
      type: new GraphQLNonNull(GraphQLID),
    },
    shippingAddress: {
      type: AddressInputType,
    },
    shippingCost: {
      type: GraphQLInt,
    },
    shippingDays: {
      type: GraphQLInt,
    },
    status: {
      type: new GraphQLNonNull(OrderStatusEnum),
    },
    lines: {
      type: new GraphQLNonNull(new GraphQLList(OrderLineInputType)),
    },
    subTotal: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    percentageDiscount: {
      type: GraphQLInt,
      description: 'Vd giảm giá 10% thì điền 10',
      defaultValue: 0,
    },
    fixedDiscount: {
      type: GraphQLInt,
      description: 'VND',
      defaultValue: 0,
    },
    totalDiscounts: {
      type: GraphQLInt,
      defaultValue: 0,
    },
    total: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    totalWeight: {
      type: GraphQLInt,
    },
    note: {
      type: GraphQLString,
    },
  },
  outputFields: {
    orderEdge: {
      type: OrderEdge,
      resolve(order) {
        return {
          cursor: offsetToCursor(0),
          node: order,
        };
      },
    },
    viewer: ViewerQueries.viewer,
  },
  async mutateAndGetPayload(obj, { loaders, user, roles, accessToken }) {
    if (!user) throw new Error('Guest không có quyền tạo Order');

    // Check quyền admin
    const validRoles = roles.filter(role => {
      return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
    });

    const { id: localCustomerId } = fromGlobalId(obj.customer);
    if (validRoles.length === 0 && user.id !== localCustomerId) {
      throw new Error('Không có quyền tạo Order cho khách hàng khác');
    }

    const orderInput = omit(obj, ['clientMutationId']);

    const customerObj = await loaders.user.load(localCustomerId);
    if (!customerObj) throw new Error('Customer not found');

    orderInput.customer = customerObj;
    orderInput.createdBy = orderInput.updatedBy = user;

    // Convert productId & check status
    orderInput.lines = orderInput.lines.map(line => {
      const { id: localProductId } = fromGlobalId(line.productId);
      line.productId = localProductId;
      return line;
    });

    const Order = Parse.Object.extend('Order');
    const newOrder = new Order();

    const acl = new Parse.ACL(customerObj);
    newOrder.setACL(acl);

    const orderObjSaved = await newOrder.save(orderInput, {
      sessionToken: accessToken, useMasterKey: true,
    });

    loaders.orders.clearAll();
    loaders.order.prime(orderObjSaved.id, orderObjSaved);
    return orderObjSaved;
  },
});

const OrderUpdateMutation = mutationWithClientMutationId({
  name: 'OrderUpdate',
  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    status: {
      type: OrderStatusEnum,
    },
    note: {
      type: GraphQLString,
    },
  },
  outputFields: {
    order: {
      type: OrderType,
      resolve(order) {
        return order;
      },
    },
  },
  async mutateAndGetPayload(obj, { loaders, user, roles, accessToken }) {
    if (!user) throw new Error('Guest không có quyền cập nhật Order');

    // Check quyền admin
    const validRoles = roles.filter(role => {
      return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
    });

    if (validRoles.length === 0) throw new Error('Không có quyền cập nhật Order');

    const { id: orderLocalId } = fromGlobalId(obj.id);
    const orderObjById = await loaders.order.load(orderLocalId);
    if (!orderObjById) throw new Error('Order not found');

    obj.updatedBy = user;

    Object.keys(obj).forEach(key => {
      if (key !== 'id') orderObjById.set(key, obj[key]);
    });

    const orderUpdated = await orderObjById.save(null, {
      sessionToken: accessToken, useMasterKey: true,
    });

    loaders.orders.clearAll();
    loaders.order.prime(orderLocalId, orderUpdated);

    return orderUpdated;
  },
});

export default {
  create: OrderCreateMutation,
  update: OrderUpdateMutation,
};
