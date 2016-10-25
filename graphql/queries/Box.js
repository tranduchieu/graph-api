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
    resolve(root, { id }, { loaders, roles }) {
      const { id: boxId } = fromGlobalId(id);
      return loaders.box.load(boxId)
      .then(boxObj => {
        if (!boxObj) throw new Error('Box not found');
        const validRoles = roles.filter(role => {
          return ['Boss', 'Administrator', 'Manager'].indexOf(role) !== -1;
        });

        if (validRoles.length === 0 && boxObj.get('visible') === false) {
          throw new Error('Permission denied for action get this Box.');
        }

        return boxObj;
      });
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
    resolve(root, args, { loaders, roles }) {
      const validRoles = roles.filter(role => {
        return ['Boss', 'Administrator', 'Manager'].indexOf(role) !== -1;
      });

      if (validRoles.length === 0) args.visible = true;
      if (args.nameStartsWith) args.nameStartsWith = latenize(args.nameStartsWith).toLowerCase();

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

      return query.count({ useMasterKey: true });
    },
  },
};
