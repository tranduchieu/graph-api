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

import checkClassSecurity from '../../services/checkClassSecurity';

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
    sku: {
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
  async mutateAndGetPayload(obj, { loaders, user }) {
    if (!user) throw new Error('Không có quyền tạo Sản phẩm');

    // Check security Class
    try {
      await checkClassSecurity('Product', 'create', user.id);
    } catch (error) {
      throw error;
    }

    const product = omit(obj, ['clientMutationId']);
    product.createdBy = product.updatedBy = user;

    const Product = Parse.Object.extend('Product');
    const newProduct = new Product();
    return newProduct.save(product, { useMasterKey: true })
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
  async mutateAndGetPayload({ id }, { loaders, user }) {
    if (!user) throw new Error('Không có quyền xóa Sản phẩm');

    // Check class security
    try {
      await checkClassSecurity('Product', 'delete', user.id);
    } catch (error) {
      throw error;
    }

    const { id: localProductId } = fromGlobalId(id);

    return loaders.product.load(localProductId)
    .then(res => {
      return res.destroy({ useMasterKey: true })
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
    sku: {
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
  async mutateAndGetPayload(obj, { loaders, user }) {
    if (!user) throw new Error('Không có quyền cập nhật Sản phẩm');

    // Check class security
    try {
      await checkClassSecurity('Product', 'update', user.id);
    } catch (error) {
      throw error;
    }

    const { id } = fromGlobalId(obj.id);
    obj.updatedBy = user;

    return loaders.product.load(id)
    .then(productClass => {
      Object.keys(obj).forEach(key => {
        if (key !== 'id') productClass.set(key, obj[key]);
      });

      return productClass.save(null, { useMasterKey: true })
      .then(res => {
        console.log(res.get('price'));
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
