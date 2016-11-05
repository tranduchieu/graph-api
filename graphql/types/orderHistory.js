import {
  GraphQLID,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLUnionType,
  GraphQLInputObjectType,
} from 'graphql';

import { GraphQLDateTime } from '@tranduchieu/graphql-custom-types';

import UserType from './user';
import { OrderStatusEnum } from './enumTypes';

const CreateOrderHistoryType = new GraphQLObjectType({
  name: 'CreateOrderHistoryType',
  fields: () => ({
    createdAt: {
      type: GraphQLDateTime,
    },
  }),
});

export const OrderHistoryTypes = new GraphQLEnumType({
  name: 'OrderHistoryTypes',
  values: {
    CREATE_ORDER: {
      value: 'createOrder',
    },
    PRINT: {
      value: 'print',
    },
    ADD_PAYMENT: {
      value: 'addPayment',
    },
    ADD_SHIPPING: {
      value: 'addShipping',
    },
    CHANGE_STATUS: {
      value: 'changeStatus',
    },
    ADD_REFUND: {
      value: 'addRefund',
    },
  },
});

const PrintHistoryType = new GraphQLObjectType({
  name: 'PrintHistoryType',
  fields: () => ({
    printedAt: {
      type: GraphQLDateTime,
    },
  }),
});

const PaymentMethods = new GraphQLEnumType({
  name: 'PaymentMethods',
  values: {
    CASH: {
      value: 'cash',
    },
    POS: {
      value: 'pos',
    },
    ATM_CARD_GATEWAY: {
      value: 'atmCardGateway',
    },
    DEBIT_CARD_GATEWAY: {
      value: 'debitCardGateWay',
    },
    TRANSFER: {
      value: 'transfer',
    },
  },
});

const PaymentHistoryType = new GraphQLObjectType({
  name: 'PaymentHistoryType',
  fields: () => ({
    paymentMethod: {
      type: PaymentMethods,
    },
    amount: {
      type: GraphQLInt,
    },
  }),
});

export const PaymentHistoryInputType = new GraphQLInputObjectType({
  name: 'PaymentHistoryInputType',
  fields: () => ({
    paymentMethod: {
      type: PaymentMethods,
    },
    amount: {
      type: GraphQLInt,
    },
  }),
});

const ShippingStatusTypes = new GraphQLEnumType({
  name: 'ShippingHistoryTypes',
  values: {
    PACKAGED_COMPLETE: {
      value: 'packagedComplete',
      description: 'Đóng gói xong. Sẵn sàng giao hàng',
    },
  },
});

const ShippingHistoryType = new GraphQLObjectType({
  name: 'ShippingHistoryType',
  fields: () => ({
    shipper: {
      type: UserType,
      resolve(data, args, { loaders }) {
        if (data.shipper) return loaders.user.load(data.shipper);
        return null;
      },
    },
    shippingStatus: {
      type: ShippingStatusTypes,
    },
  }),
});

export const ShippingHistoryInputType = new GraphQLInputObjectType({
  name: 'ShippingHistoryInputType',
  fields: () => ({
    shipper: {
      type: GraphQLID,
    },
    shippingStatus: {
      type: ShippingStatusTypes,
    },
  }),
});

const RefundHistoryType = new GraphQLObjectType({
  name: 'RefundHistoryType',
  fields: () => ({
    refundMethod: {
      type: PaymentMethods,
    },
    amount: {
      type: GraphQLInt,
    },
  }),
});

export const RefundHistoryInputType = new GraphQLInputObjectType({
  name: 'RefundHistoryInputType',
  fields: () => ({
    refundMethod: {
      type: PaymentMethods,
    },
    amount: {
      type: GraphQLInt,
    },
  }),
});

const StatusHistoryType = new GraphQLObjectType({
  name: 'OrderStatusHistoryType',
  fields: () => ({
    oldStatus: {
      type: OrderStatusEnum,
    },
    newStatus: {
      type: OrderStatusEnum,
    },
    reason: {
      type: GraphQLString,
    },
  }),
});

// const LinesHistoryType = new GraphQLObjectType({
//   name: 'OrderLinesHistoryType',
//   fields: () => ({
//     oldLines: {
//       type: new GraphQLList(OrderLineType),
//     },
//     newLines: {
//       type: new GraphQLList(OrderLineType),
//     },
//   }),
// });

// const OrderDiscountsType = new GraphQLObjectType({
//   name: 'OrderDiscountsType',
//   fields: () => ({
//     percentageDiscount: {
//       type: GraphQLInt,
//     },
//     fixedDiscount: {
//       type: GraphQLInt,
//     },
//     totalDiscounts: {
//       type: GraphQLInt,
//     },
//   }),
// });

// const DiscountsHistoryType = new GraphQLObjectType({
//   name: 'DiscountsHistoryType',
//   fields: () => ({
//     oldDiscounts: {
//       type: OrderDiscountsType,
//     },
//     newDiscounts: {
//       type: OrderDiscountsType,
//     },
//   }),
// });

const resolveType = (data) => {
  if (data.createdAt) return CreateOrderHistoryType;
  if (data.printedAt) return PrintHistoryType;
  if (data.paymentMethod) return PaymentHistoryType;
  if (data.shippingStatus) return ShippingHistoryType;
  if (data.oldStatus) return StatusHistoryType;
  if (data.refundMethod) return RefundHistoryType;
  throw new Error('Type not found');
};

const HistoryContentType = new GraphQLUnionType({
  name: 'HistoryContentType',
  types: () => ([
    CreateOrderHistoryType,
    PrintHistoryType,
    PaymentHistoryType,
    ShippingHistoryType,
    StatusHistoryType,
    RefundHistoryType,
  ]),
  resolveType,
});

export const OrderHistory = new GraphQLObjectType({
  name: 'OrderHistory',
  description: 'Order History type',
  fields: () => ({
    type: {
      type: OrderHistoryTypes,
    },
    content: {
      type: HistoryContentType,
    },
    updatedAt: {
      type: GraphQLDateTime,
    },
    updatedBy: {
      type: UserType,
      resolve(data, args, { loaders }) {
        return loaders.user.load(data.updatedBy);
      },
    },
  }),
});
