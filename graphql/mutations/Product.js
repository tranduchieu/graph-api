import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';

import {
  fromGlobalId,
  cursorForObjectInConnection,
  mutationWithClientMutationId,
  offsetToCursor,
} from 'graphql-relay';

import { omit } from 'lodash';
import Parse from 'parse/node';

import ProductType from '../types/product';
import { ProductEdge } from '../connections/product';
import ViewerQueries from '../queries/Viewer';

function getCursor(dataList, item) {
  for (const i of dataList) {
    if (i.id === item.id) {
      return cursorForObjectInConnection(dataList, i);
    }
  }
  return null;
}

const ProductCreateMutation = mutationWithClientMutationId({
  name: 'ProductCreate',
  inputFields: {

  },
  outputFields: {
    productEdge: {
      type: ProductEdge,
      resolve(product) {
        return {
          cursor: offsetToCursor(0),
          node: product,
        };
      },
    },
    viewer: ViewerQueries.viewer,
  },
  mutateAndGetPayload(obj, { loaders }) {
    const product = omit(obj, ['clientMutationId']);

    const Product = Parse.Object.extend('Product');
    
  }
});
