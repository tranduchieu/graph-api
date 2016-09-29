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
    createProduct: ProductMutation.create,
    updateProduct: ProductMutation.update,
    removeProduct: ProductMutation.remove,
    shortId: ShortIdMutation,
    createOrder: OrderMutation.create,
  },
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default Schema;
