import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql';

import { nodeField } from './relay/RelayNode';

import UserType from './types/user';

import ProductQueries from './queries/Product';
import ProductTagQueries from './queries/ProductTag';
import OrderQueries from './queries/Order';
import BoxQueries from './queries/Box';

import ProductMutation from './mutations/Product';
import ShortIdMutation from './mutations/ShortId';
import UserMutation from './mutations/User';
import OrderMutation from './mutations/Order';
import BoxMutation from './mutations/Box';
import ProductTagMutation from './mutations/ProductTag';

const Query = new GraphQLObjectType({
  name: 'Query',
  description: 'This is a root Query',
  fields: () => ({
    node: nodeField,
    viewer: {
      type: UserType,
      resolve(root, args, { user }) {
        return user || {};
      },
    },
    product: ProductQueries.product,
    productTag: ProductTagQueries.productTag,
    box: BoxQueries.box,
    order: OrderQueries.order,
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
    shortId: ShortIdMutation,
    createOrder: OrderMutation.create,
    updateOrder: OrderMutation.update,
  }),
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default Schema;
