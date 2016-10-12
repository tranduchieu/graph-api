import {
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

import {
  connectionArgs,
  connectionFromPromisedArray,
} from 'graphql-relay';

import { SearchTypesEnum } from '../types/enumTypes';

import { SearchConnection } from '../connections/search';

export default {
  searchs: {
    type: SearchConnection,
    args: {
      text: {
        type: new GraphQLNonNull(GraphQLString),
      },
      type: {
        type: new GraphQLNonNull(SearchTypesEnum),
      },
      skip: {
        type: GraphQLInt,
        defaultValue: 0,
      },
      limit: {
        type: GraphQLInt,
        defaultValue: 20,
      },
      ...connectionArgs,
    },
    resolve(root, args, { loaders }) {
      return connectionFromPromisedArray(loaders.searchs.load(JSON.stringify(args)), {});
    },
  },
  searchsCount: {
    type: GraphQLInt,
    args: {
      text: {
        type: new GraphQLNonNull(GraphQLString),
      },
      type: {
        type: new GraphQLNonNull(SearchTypesEnum),
      },
    },
    resolve(root, args, { loaders }) {
      return loaders.searchsCount.load(JSON.stringify(args));
    },
  },
};
