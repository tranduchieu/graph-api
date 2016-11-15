import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql';

import {
  fromGlobalId,
  mutationWithClientMutationId,
  offsetToCursor,
} from 'graphql-relay';

import { omit } from 'lodash';
import Parse from 'parse/node';
import moment from 'moment';

import OrderType from '../types/order';
import { OrderLineInputType } from '../types/orderLine';
import {
  ShopEnumType,
  OrderStatusEnum,
} from '../types/enumTypes';

import { OrderEdge } from '../connections/order';
import UserType from '../types/user';
import { AddressInputType } from '../types/address';
import {
  PaymentHistoryInputType,
  RefundHistoryInputType,
  ShippingHistoryInputType,
} from '../types/orderHistory';

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
      defaultValue: 'pending',
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
    viewer: {
      type: UserType,
      resolve(root, args, { user }) {
        return user || {};
      },
    },
  },
  async mutateAndGetPayload(obj, { loaders, user, roles, accessToken, staffWorkingAt }) {
    if (!user) throw new Error('Guest không có quyền tạo Order');

    // Check quyền admin
    const validRoles = roles.filter(role => {
      return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
    });

    const { id: localCustomerId } = fromGlobalId(obj.customer);
    if (validRoles.length === 0 && user.id !== localCustomerId) {
      throw new Error('Không có quyền tạo Order cho khách hàng khác');
    }

    if (staffWorkingAt && obj.shop !== staffWorkingAt) {
      throw new Error('Shop trong Hóa đơn không đúng với nơi bạn đang làm việc');
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
      description: 'Nếu hủy hóa đơn thì bắt buộc gửi kèm lý do orderCancellationReason',
      type: OrderStatusEnum,
    },
    orderCancellationReason: {
      type: GraphQLString,
    },
    note: {
      type: GraphQLString,
    },
    print: {
      type: GraphQLBoolean,
    },
    addPayment: {
      type: PaymentHistoryInputType,
    },
    addRefund: {
      type: RefundHistoryInputType,
    },
    addShipping: {
      type: ShippingHistoryInputType,
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

    // History
    const history = orderObjById.get('history');

    // Nếu hủy hóa đơn thì bắt buộc gửi kèm lý do
    if (obj.status && obj.status === 'canceled' && !obj.orderCancellationReason) {
      throw new Error('Hủy hóa đơn bắt buộc gửi kèm lý do');
    }

    // Push changeStatus history
    if (obj.status) {
      history.unshift({
        type: 'changeStatus',
        content: {
          oldStatus: orderObjById.get('status'),
          newStatus: obj.status,
          reason: obj.orderCancellationReason || null,
        },
        updatedAt: moment().format(),
        updatedBy: user.id,
      });
    }

    // Push print history
    if (obj.print) {
      history.unshift({
        type: 'print',
        content: {
          printedAt: moment().format(),
        },
        updatedAt: moment().format(),
        updatedBy: user.id,
      });
    }

    // Push addPayment history
    if (obj.addPayment) {
      history.unshift({
        type: 'addPayment',
        content: obj.addPayment,
        updatedAt: moment().format(),
        updatedBy: user.id,
      });
    }

    // Push addRefund history
    if (obj.addRefund) {
      history.unshift({
        type: 'addRefund',
        content: obj.addRefund,
        updatedAt: moment().format(),
        updatedBy: user.id,
      });
    }

    // Push addShipping history
    let lastHistoryShippingStatus;
    if (history.length > 0) {
      history.forEach(item => {
        if (item.type === 'addShipping' && !lastHistoryShippingStatus) {
          lastHistoryShippingStatus = item.content.shippingStatus;
        }
      });
    }
    const shippingStatus = ['packaged', 'shipperReceived', 'delivered', 'backReceived'];

    if (obj.addShipping) {
      if (lastHistoryShippingStatus && (shippingStatus.indexOf(lastHistoryShippingStatus) >= shippingStatus.indexOf(obj.addShipping.shippingStatus))) {
        throw new Error(`Đơn hàng này đã thêm trạng thái ${lastHistoryShippingStatus}. Không thể thêm trạng thái ${obj.addShipping.shippingStatus}`);
      }
      obj.addShipping.shipper = fromGlobalId(obj.addShipping.shipper).id;
      history.unshift({
        type: 'addShipping',
        content: obj.addShipping,
        updatedAt: moment().format(),
        updatedBy: user.id,
      });
    }

    obj.history = history;
    obj.updatedBy = user;

    obj = omit(obj, ['clientMutationId', 'print', 'addPayment', 'addRefund', 'addShipping']);

    Object.keys(obj).forEach(key => {
      if (key !== 'id') orderObjById.set(key, obj[key]);
    });

    const orderUpdated = await orderObjById.save(null, {
      sessionToken: accessToken, useMasterKey: true,
    });

    return orderUpdated;
  },
});

export default {
  create: OrderCreateMutation,
  update: OrderUpdateMutation,
};
