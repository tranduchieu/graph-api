import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql';

import { nodeField } from './relay/RelayNode';

import ViewerQueries from './queries/Viewer';

import ProductMutation from './mutations/Product';
import ShortIdMutation from './mutations/ShortId';
import AddressMutation from './mutations/Address';
import UserMutation from './mutations/User';

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
    createAddress: AddressMutation.create,
    removeAddress: AddressMutation.remove,
    createProduct: ProductMutation.create,
    updateProduct: ProductMutation.update,
    removeProduct: ProductMutation.remove,
    shortId: ShortIdMutation,
  },
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default Schema;
