import {
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';

import {
  mutationWithClientMutationId,
  offsetToCursor,
} from 'graphql-relay';

import { omit } from 'lodash';
import Parse from 'parse/node';

import { ProductTagEdge } from '../connections/productTag';
import UserType from '../types/user';

const ProductTagCreateMutation = mutationWithClientMutationId({
  name: 'ProductTagCreate',
  inputFields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    description: {
      type: GraphQLString,
    },
  },
  outputFields: {
    productTagEdge: {
      type: ProductTagEdge,
      resolve(productTag) {
        return {
          cursor: offsetToCursor(0),
          node: productTag,
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
      throw new Error('Không có quyền tạo Product Tag');
    }

    const productTagInput = omit(obj, ['clientMutationId']);

    const ProductTag = Parse.Object.extend('ProductTag');
    const newProductTag = new ProductTag();
    const productTagObjSaved = await newProductTag.save(productTagInput, {
      sessionToken: accessToken, useMasterKey: true,
    });

    loaders.productTags.clearAll();
    loaders.productTag.prime(productTagObjSaved.id, productTagObjSaved);

    return productTagObjSaved;
  },
});

export default {
  create: ProductTagCreateMutation,
};
