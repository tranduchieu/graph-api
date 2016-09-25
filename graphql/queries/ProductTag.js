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

import latenize from '../../services/latenize';

import ProductTagType from '../types/productTag';
import { ProductTagConnection } from '../connections/productTag';

export default {
  productTag: {
    type: ProductTagType,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve(root, { id }, { loaders }) {
      const { id: productTagId } = fromGlobalId(id);
      return loaders.productTag.load(productTagId);
    },
  },
  productTags: {
    type: ProductTagConnection,
    args: {
      nameStartsWith: {
        type: GraphQLString,
      },
      ...connectionArgs,
    },
    resolve(root, args, { loaders }) {
      if (args.nameStartsWith) args.nameStartsWith = latenize(args.nameStartsWith).toLowerCase();

      return connectionFromPromisedArray(loaders.productTags.load(JSON.stringify(args)), {});
    },
  },
  productTagsCount: {
    type: GraphQLInt,
    resolve() {
      const query = new Parse.Query('ProductTag');
      return query.count({ useMasterKey: true });
    },
  },
};
