import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql';

import { nodeField } from './relay/RelayNode';

import UserQueries from './queries/User';
import ProductQueries from './queries/Product';
import ProductTagQueries from './queries/ProductTag';
import OrderQueries from './queries/Order';
import BoxQueries from './queries/Box';
import ReportQueries from './queries/Report';

import ProductMutation from './mutations/Product';
import ShortIdMutation from './mutations/ShortId';
import UserMutation from './mutations/User';
import OrderMutation from './mutations/Order';
import BoxMutation from './mutations/Box';
import ProductTagMutation from './mutations/ProductTag';
import ReportMutation from './mutations/Report';

const Query = new GraphQLObjectType({
  name: 'Query',
  description: 'This is a root Query',
  fields: () => ({
    node: nodeField,
    viewer: UserQueries.viewer,
    product: ProductQueries.product,
    productTag: ProductTagQueries.productTag,
    box: BoxQueries.box,
    order: OrderQueries.order,
    shiftReport: ReportQueries.shiftReport,
  }),
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'This is a root Mutation',
  fields: () => ({
    createUser: UserMutation.create,
    removeUser: UserMutation.remove,
    updateUser: UserMutation.update,
    createBox: BoxMutation.create,
    createProduct: ProductMutation.create,
    updateProduct: ProductMutation.update,
    removeProduct: ProductMutation.remove,
    createProductTag: ProductTagMutation.create,
    shortId: ShortIdMutation.getOne,
    shortIdBatchAdd: ShortIdMutation.batchAdd,
    createOrder: OrderMutation.create,
    updateOrder: OrderMutation.update,
    createShiftReport: ReportMutation.createShiftReport,
    updateShiftReport: ReportMutation.updateShiftReport,
  }),
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default Schema;
