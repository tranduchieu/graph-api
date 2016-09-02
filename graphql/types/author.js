import {

  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

import {
  globalIdField,
} from 'graphql-relay';

import { GraphQLURL } from '@tranduchieu/graphql-custom-types';

const Author = new GraphQLObjectType({
  name: 'Author',
  description: 'Author type',
  fields: {
    id: globalIdField('User'),
    name: { type: GraphQLString },
    username: { type: GraphQLString },
    avatarUrl: { type: GraphQLURL },
  },
});

export default Author;
