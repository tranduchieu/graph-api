import {
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
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
      types: {
        type: new GraphQLList(SearchTypesEnum),
        defaultValue: [],
      },
      ratio: {
        type: new GraphQLList(GraphQLInt),
        defaultValue: [],
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
      // Validate
      // ---------------------------
      // [x] types & ratio same length
      // [x] ratio total = 100%
      // [] roles
      if (args.types.length > 1 && args.types.length !== args.ratio.length) {
        throw new Error('types & ratio not same length');
      }

      const ratioTotal = args.ratio.reduce((a, b) => {
        return a + b;
      }, 0);

      if (args.ratio.length > 0 && ratioTotal !== 100) {
        throw new Error('ratio toal not equal 100');
      }

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
