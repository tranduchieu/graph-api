import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';

import {
  globalIdField,
} from 'graphql-relay';

import { GraphQLDateTime } from '@tranduchieu/graphql-custom-types';

import { nodeInterface } from '../relay/RelayNode';
import RelayRegistry from '../relay/RelayRegistry';

import UserType from './user';
import { ShopEnumType } from './enumTypes';

export const SalesReport = new GraphQLObjectType({
  name: 'SalesReport',
  fields: () => ({
    itemsSold: {
      type: GraphQLInt,
    },
    revenue: {
      type: GraphQLInt,
    },
    cash: {
      type: GraphQLInt,
    },
    bank: {
      type: GraphQLInt,
    },
  }),
});

export const CustomersReport = new GraphQLObjectType({
  name: 'CustomersReport',
  fields: () => ({
    num: {
      type: GraphQLInt,
    },
  }),
});

export function shiftReportResolver(_, { id }, { loaders }) {
  return loaders.shiftReport.load(id);
}

const ShiftReportAdjustEnumType = new GraphQLEnumType({
  name: 'ShiftReportAdjustEnumType',
  values: {
    ADD: {
      value: 'add',
    },
    SUBTRACT: {
      value: 'subtract',
    },
  },
});

const ShiftReportAdjust = new GraphQLObjectType({
  name: 'ShiftReportAdjust',
  fields: () => ({
    type: {
      type: ShiftReportAdjustEnumType,
    },
    amount: {
      type: GraphQLInt,
    },
    note: {
      type: GraphQLString,
    },
  }),
});

export const ShiftReportAdjustInput = new GraphQLInputObjectType({
  name: 'ShiftReportAdjustInput',
  fields: () => ({
    type: {
      type: ShiftReportAdjustEnumType,
    },
    amount: {
      type: GraphQLInt,
    },
    note: {
      type: GraphQLString,
    },
  }),
});

export const ShiftReport = new GraphQLObjectType({
  name: 'ShiftReport',
  fields: () => ({
    id: globalIdField('ShiftReport'),
    start: {
      type: GraphQLDateTime,
      resolve(data) {
        return data.get('start');
      },
    },
    end: {
      type: GraphQLDateTime,
      resolve(data) {
        return data.get('end');
      },
    },
    shop: {
      type: ShopEnumType,
      resolve(data) {
        return data.get('shop');
      },
    },
    staff: {
      type: UserType,
      resolve(data, args, { loaders }) {
        const { id } = data.get('staff');
        return loaders.user.load(id);
      },
    },
    itemsSold: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('itemsSold');
      },
    },
    revenue: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('revenue');
      },
    },
    cash: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('cash');
      },
    },
    bank: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('bank');
      },
    },
    adjust: {
      type: new GraphQLList(ShiftReportAdjust),
      resolve(data) {
        return data.get('adjust');
      },
    },
    note: {
      type: GraphQLString,
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

RelayRegistry.registerResolverForType(ShiftReport, shiftReportResolver);
export default RelayRegistry.registerNodeType(ShiftReport);
