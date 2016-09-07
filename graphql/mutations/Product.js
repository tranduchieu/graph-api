import {
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInputObjectType,
} from 'graphql';

import {
  GraphQLURL,
} from '@tranduchieu/graphql-custom-types';

import {
  fromGlobalId,
  mutationWithClientMutationId,
  offsetToCursor,
} from 'graphql-relay';

import { omit } from 'lodash';
import Parse from 'parse/node';

import ProductType from '../types/product';
import {
  ShopEnumType,
  ProductStatusEnum,
} from '../types/enumTypes';

import { ProductEdge } from '../connections/product';
import ViewerQueries from '../queries/Viewer';

const AdditionalPropertiesType = new GraphQLInputObjectType({
  name: 'ProductAdditionalPropertiesInput',
  fields: {
    name: {
      type: GraphQLString,
    },
    value: {
      type: GraphQLString,
    },
  },
});

const ProductCreateMutation = mutationWithClientMutationId({
  name: 'ProductCreate',
  inputFields: {
    description: {
      type: GraphQLString,
    },
    code: {
      type: new GraphQLNonNull(GraphQLString),
    },
    shop: {
      type: new GraphQLNonNull(ShopEnumType),
    },
    boxes: {
      type: new GraphQLList(GraphQLString),
    },
    status: {
      type: new GraphQLNonNull(ProductStatusEnum),
    },
    featured: {
      type: GraphQLBoolean,
      defaultValue: false,
    },
    images: {
      type: new GraphQLList(GraphQLURL),
    },
    tags: {
      type: new GraphQLList(GraphQLString),
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
      type: new GraphQLList(AdditionalPropertiesType),
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
  async mutateAndGetPayload(obj, { loaders, user, accessToken }) {
    const product = omit(obj, ['clientMutationId']);
    product.createdBy = product.updatedBy = user;

    const Product = Parse.Object.extend('Product');
    const newProduct = new Product();
    return newProduct.save(product, { sessionToken: accessToken })
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
  async mutateAndGetPayload({ id }, { loaders, accessToken }) {
    const { id: localProductId } = fromGlobalId(id);

    return loaders.product.load(localProductId)
    .then(res => {
      if (!res) throw new Error('Product not found');

      return res.destroy({ sessionToken: accessToken })
      .then(item => {
        loaders.products.clearAll();
        loaders.product.clear(localProductId);
        return Object.assign({}, item, { id });
      });
    });
  },
});

const ProductUpdateMutation = mutationWithClientMutationId({
  name: 'ProductUpdate',
  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    description: {
      type: GraphQLString,
    },
    code: {
      type: GraphQLString,
    },
    shop: {
      type: ShopEnumType,
    },
    boxes: {
      type: new GraphQLList(GraphQLString),
    },
    status: {
      type: ProductStatusEnum,
    },
    featured: {
      type: GraphQLBoolean,
      defaultValue: false,
    },
    images: {
      type: new GraphQLList(GraphQLURL),
    },
    tags: {
      type: new GraphQLList(GraphQLString),
    },
    price: {
      type: GraphQLInt,
    },
    salePrice: {
      type: GraphQLInt,
    },
    weight: {
      type: GraphQLInt,
    },
    additionalProperties: {
      type: new GraphQLList(AdditionalPropertiesType),
    },
  },
  outputFields: {
    product: {
      type: ProductType,
      resolve(product) {
        return product;
      },
    },
  },
  async mutateAndGetPayload(obj, { loaders, user, accessToken }) {
    const { id } = fromGlobalId(obj.id);
    obj.updatedBy = user;

    return loaders.product.load(id)
    .then(productObj => {
      if (!productObj) throw new Error('Product not found');

      Object.keys(obj).forEach(key => {
        if (key !== 'id') productObj.set(key, obj[key]);
      });

      return productObj.save(null, { sessionToken: accessToken })
      .then(res => {
        loaders.products.clearAll();
        loaders.product.prime(id, res);
        return res;
      });
    });
  },
});

export default {
  create: ProductCreateMutation,
  remove: ProductRemoveMutation,
  update: ProductUpdateMutation,
};
