import {
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql';

import {
  mutationWithClientMutationId,
  offsetToCursor,
} from 'graphql-relay';

import { omit } from 'lodash';
import Parse from 'parse/node';

import { GraphQLURL } from '@tranduchieu/graphql-custom-types';

import {
  BoxTypesEnum,
} from '../types/enumTypes';
import UserType from '../types/user';

import { BoxEdge } from '../connections/box';

const BoxCreateMutation = mutationWithClientMutationId({
  name: 'BoxCreate',
  inputFields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    type: {
      type: new GraphQLNonNull(BoxTypesEnum),
    },
    description: {
      type: GraphQLString,
    },
    featured: {
      type: GraphQLBoolean,
      defaultValue: false,
    },
    position: {
      type: GraphQLInt,
    },
    visible: {
      type: GraphQLBoolean,
      defaultValue: true,
    },
    coverImageSrc: {
      type: GraphQLURL,
    },
  },
  outputFields: {
    boxEdge: {
      type: BoxEdge,
      resolve(box) {
        return {
          cursor: offsetToCursor(0),
          node: box,
        };
      },
    },
    viewer: {
      type: UserType,
      resolve(root, args, { user }) {
        return user || {};
      },
    },
  },
  async mutateAndGetPayload(obj, { loaders, user, roles, accessToken, useMasterKey }) {
    // Check quyền admin
    const validRoles = roles.filter(role => {
      return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
    });

    if (!useMasterKey && (!user || validRoles.length === 0)) {
      throw new Error('Không có quyền tạo Box');
    }

    const boxInput = omit(obj, ['clientMutationId']);

    const Box = Parse.Object.extend('Box');
    const newBox = new Box();
    const boxObjSaved = await newBox.save(boxInput, {
      sessionToken: accessToken, useMasterKey: true,
    });

    loaders.boxes.clearAll();
    loaders.box.prime(boxObjSaved.id, boxObjSaved);

    return boxObjSaved;
  },
});

export default {
  create: BoxCreateMutation,
};
