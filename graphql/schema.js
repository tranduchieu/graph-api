import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql';

import { nodeField } from './relay/RelayNode';

import ViewerQueries from './queries/Viewer';

import ProductMutation from './mutations/Product';

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
    createProduct: ProductMutation.create,
    updateProduct: ProductMutation.update,
    removeProduct: ProductMutation.remove,
  },
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default Schema;
