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

import BoxType from '../types/box';
import { BoxTypesEnum } from '../types/enumTypes';

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
  boxes: {
    type: BoxConnection,
    args: {
      nameStartsWith: {
        type: GraphQLString,
      },
      visible: {
        type: GraphQLBoolean,
      },
      ...connectionArgs,
    },
    resolve(root, args, { loaders }) {
      if (args.nameStartsWith) args.nameStartsWith = args.nameStartsWith.toLowerCase();
      return connectionFromPromisedArray(loaders.boxes.load(JSON.stringify(args)), {});
    },
  },
  boxesCount: {
    type: GraphQLInt,
    args: {
      type: {
        type: BoxTypesEnum,
      },
      visible: {
        type: GraphQLBoolean,
      },
    },
    resolve(root, args) {
      const Box = Parse.Object.extend('Box');
      const query = new Parse.Query(Box);

      Object.keys(args).forEach(async key => {
        query.equalTo(key, args[key]);
      });

      return query.count();
    },
  },
};
