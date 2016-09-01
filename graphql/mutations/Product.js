import {
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean,
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
import axios from 'axios';

import ProductType from '../types/product';
import {
  ShopEnumType,
  ProductStatusEnum,
} from '../types/enumTypes';

import { ProductEdge } from '../connections/product';
import ViewerQueries from '../queries/Viewer';

import checkClassSecurity from '../../services/checkClassSecurity';

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
    description: {
      type: GraphQLString,
    },
    sku: {
      type: new GraphQLNonNull(GraphQLString),
    },
    shop: {
      type: new GraphQLNonNull(ShopEnumType),
    },
    boxes: {
      type: new GraphQLNonNull(GraphQLList),
    },
    status: {
      type: new GraphQLNonNull(ProductStatusEnum),
    },
    featured: {
      type: GraphQLBoolean,
      defaultValue: false,
    },
    images: {
      type: GraphQLList,
    },
    tags: {
      type: GraphQLList,
    },
    price: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    salePrice: {
      type: GraphQLInt,
    },
    weight: {
      type: GraphQLInt,
    },
    additionalProperties: {
      type: GraphQLList,
    },
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
  async mutateAndGetPayload(obj, { loaders, user }) {
    // const { description, sku, shop, boxes, status, featured, } = obj;
    if (!user) throw new Error('Không có quyền tạo Sản phẩm');

    // Check security Class
    try {
      await checkClassSecurity('Product', 'create', user.id);
    } catch (error) {
      throw error;
    }

    const product = omit(obj, ['clientMutationId']);

    const Product = Parse.Object.extend('Product');
    const newProduct = new Product();
    newProduct.save(product)
    .then(data => {
      loaders.products.clearAll();
      loaders.product.prime(data.id, data);
      return data;
    });
  },
});

const ProductRemoveMutation = mutationWithClientMutationId({
  name: 'ProductRemove',
  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  outputFields: {
    deletedProductId: {
      type: GraphQLID,
      resolve: ({ id }) => {
        return id;
      },
    },
    viewer: ViewerQueries.viewer,
  },
  mutateAndGetPayload({ id }, { loaders, user }) {
    const { id: localProductId } = fromGlobalId(id);
  }
});
