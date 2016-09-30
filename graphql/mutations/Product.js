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
      defaultValue: [],
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      defaultValue: [],
    },
    price: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    salePrice: {
      type: GraphQLInt,
      defaultValue: null,
    },
    weight: {
      type: GraphQLInt,
      defaultValue: 0,
    },
    additionalProperties: {
      type: new GraphQLList(AdditionalPropertiesType),
      defaultValue: [],
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
  async mutateAndGetPayload(obj, { loaders, user, roles, accessToken }) {
    if (!user) throw new Error('Guest không có quyền tạo Sản phẩm');

    // Check quyền admin
    const validRoles = roles.filter(role => {
      return ['Boss', 'Administrator', 'Manager'].indexOf(role) !== -1;
    });

    if (validRoles.length === 0) throw new Error('Không có quyền tạo Sản phẩm');

    const product = omit(obj, ['clientMutationId']);
    product.createdBy = product.updatedBy = user;

    const Product = Parse.Object.extend('Product');
    const newProduct = new Product();
    const acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    newProduct.setACL(acl);
    return newProduct.save(product, { sessionToken: accessToken })
    .then(productSavedObj => {
      loaders.products.clearAll();
      loaders.product.prime(productSavedObj.id, productSavedObj);
      return productSavedObj;
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
  async mutateAndGetPayload({ id }, { loaders, user, roles, accessToken }) {
    if (!user) throw new Error('Guest không có quyền xóa Sản phẩm');

    // Check quyền admin
    const validRoles = roles.filter(role => {
      return ['Boss', 'Administrator', 'Manager'].indexOf(role) !== -1;
    });

    if (validRoles.length === 0) throw new Error('Không có quyền xóa Sản phẩm');

    const { id: localProductId } = fromGlobalId(id);

    return loaders.product.load(localProductId)
    .then(res => {
      if (!res) throw new Error('Product not found');

      return res.destroy({ sessionToken: accessToken, useMasterKey: true })
      .then(productDeletedObj => {
        loaders.products.clearAll();
        loaders.product.clear(localProductId);
        return Object.assign({}, productDeletedObj, { id });
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
  async mutateAndGetPayload(obj, { loaders, user, roles, accessToken }) {
    if (!user) throw new Error('Guest không có quyền cập nhật Sản phẩm');

    // Check quyền admin
    const validRoles = roles.filter(role => {
      return ['Boss', 'Administrator', 'Manager'].indexOf(role) !== -1;
    });

    if (validRoles.length === 0) throw new Error('Không có quyền cập nhật Sản phẩm');

    const { id } = fromGlobalId(obj.id);
    obj.updatedBy = user;

    return loaders.product.load(id)
    .then(productObj => {
      if (!productObj) throw new Error('Product not found');

      Object.keys(obj).forEach(key => {
        if (key !== 'id') productObj.set(key, obj[key]);
      });

      return productObj.save(null, { sessionToken: accessToken, useMasterKey: true })
      .then(productUpdatedObj => {
        loaders.products.clearAll();
        loaders.product.prime(id, productUpdatedObj);
        return productUpdatedObj;
      });
    });
  },
});

export default {
  create: ProductCreateMutation,
  remove: ProductRemoveMutation,
  update: ProductUpdateMutation,
};
