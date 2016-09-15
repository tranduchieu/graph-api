import Parse from 'parse/node';
import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

import {
  fromGlobalId,
  connectionArgs,
  connectionFromPromisedArray,
} from 'graphql-relay';

import BoxType from '../types/box';

import { BoxConnection } from '../connections/box';

export default {
  box: {
    type: BoxType,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve(root, { id }, { loaders }) {
      const { id: boxId } = fromGlobalId(id);
      return loaders.box.load(boxId);
    },
  },
};
