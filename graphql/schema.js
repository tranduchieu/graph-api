import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql';

import { nodeField } from './relay/RelayNode';

import ViewerQueries from './queries/Viewer';

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
    viewer: ViewerQueries.viewer,
  }),
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'This is a root Mutation',
  fields: {
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
  },
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default Schema;
