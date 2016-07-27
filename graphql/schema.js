import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql';

import { nodeField } from './relay/RelayNode';

import ViewerQueries from './queries/Viewer';

const Query = new GraphQLObjectType({
  name: 'Query',
  description: 'This is a root Query',
  fields: () => ({
    node: nodeField,
    viewer: ViewerQueries.viewer,
  }),
});

const Schema = new GraphQLSchema({
  query: Query,
});

export default Schema;
