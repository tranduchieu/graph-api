import {
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLObjectType,
} from 'graphql';

import {
  globalIdField,
} from 'graphql-relay';

import { GraphQLDateTime, GraphQLURL } from '@tranduchieu/graphql-custom-types';
import { BoxTypesEnum } from './enumTypes';

import { nodeInterface } from '../relay/RelayNode';
import RelayRegistry from '../relay/RelayRegistry';

import UserType from './user';

export function boxResolver(_, { id }, { loaders }) {
  return loaders.box.load(id);
}

const Box = new GraphQLObjectType({
  name: 'Box',
  description: 'Box type',
  fields: () => ({
    id: globalIdField('Box'),
    name: {
      type: GraphQLString,
      resolve(data) {
        return data.get('name');
      },
    },
    type: {
      type: BoxTypesEnum,
      resolve(data) {
        return data.get('type');
      },
    },
    description: {
      type: GraphQLString,
      resolve(data) {
        return data.get('description');
      },
    },
    featured: {
      type: GraphQLBoolean,
      resolve(data) {
        return data.get('featured');
      },
    },
    position: {
      type: GraphQLInt,
      resolve(data) {
        return data.get('position');
      },
    },
    visible: {
      type: GraphQLBoolean,
      resolve(data) {
        return data.get('visible');
      },
    },
    coverImageSrc: {
      type: GraphQLURL,
      resolve(data) {
        return data.get('coverImageSrc');
      },
    },
    createdAt: {
      type: GraphQLDateTime,
      resolve(data) {
        return data.get('createdAt');
      },
    },
    updatedAt: {
      type: GraphQLDateTime,
      resolve(data) {
        return data.get('updatedAt');
      },
    },
    viewer: {
      type: UserType,
      resolve(root, args, { user }) {
        return user || {};
      },
    },
  }),
  interfaces: [nodeInterface],
});

RelayRegistry.registerResolverForType(Box, boxResolver);
export default RelayRegistry.registerNodeType(Box);
