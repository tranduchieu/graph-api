import Parse from 'parse/node';
import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
} from 'graphql';

import {
  fromGlobalId,
  connectionArgs,
  connectionFromPromisedArray,
} from 'graphql-relay';

import latenize from '../../services/latenize';

import SearchableType from '../types/search';
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
      ...connectionArgs,
    },
    resolve(root, args, { loaders }) {

    },
  },
};
