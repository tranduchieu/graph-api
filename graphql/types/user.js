import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLList,
  GraphQLEnumType,
} from 'graphql';

import {
  globalIdField,
} from 'graphql-relay';

import {
  GraphQLEmail,
  GraphQLURL,
  GraphQLMobilePhone,
  GraphQLDateTime,
} from '@tranduchieu/graphql-custom-types';
import { AddressType } from './address';
import { ShopEnumType } from './enumTypes';

import { nodeInterface } from '../relay/RelayNode';
import RelayRegistry from '../relay/RelayRegistry';

import ProductQueries from '../queries/Product';
import ProductTagQueries from '../queries/ProductTag';
import OrderQueries from '../queries/Order';
import BoxQueries from '../queries/Box';
import SearchQueries from '../queries/Search';
import UserQueries from '../queries/User';
import DistrictQueries from '../queries/District';

export const RolesEnumType = new GraphQLEnumType({
  name: 'RolesEnumType',
  values: {
    BOSS: {
      value: 'Boss',
    },
    ADMINISTRATOR: {
      value: 'Administrator',
    },
    MANAGER: {
      value: 'Manager',
    },
    CUSTOMER: {
      value: 'Customer',
    },
    SALES: {
      value: 'Sales',
    },
    USER: {
      value: 'User',
    },
    SHIPPER: {
      value: 'Shipper',
    },
  },
});

// Resolver
export function userResolver(_, { id }, { loaders }) {
  return loaders.user.load(id);
}

const User = new GraphQLObjectType({
  name: 'User',
  description: 'User type',
  fields: () => ({
    id: globalIdField('User'),
    name: {
      type: GraphQLString,
      resolve(data) {
        return data.get('name');
      },
    },
    username: {
      type: GraphQLString,
      resolve(data) {
        return data.get('username');
      },
    },
    password: {
      type: GraphQLString,
    },
    roles: {
      type: new GraphQLList(GraphQLString),
      resolve({ id }, args, { loaders }) {
        return loaders.rolesByUser.load(id);
      },
    },
    email: {
      type: GraphQLEmail,
      resolve(data) {
        return data.get('email');
      },
    },
    emailVerified: {
      type: GraphQLBoolean,
      resolve(data) {
        return data.get('emailVerified');
      },
    },
    mobilePhone: {
      type: GraphQLMobilePhone,
      resolve(data) {
        return data.get('mobilePhone');
      },
    },
    mobilePhoneVerified: {
      type: GraphQLBoolean,
      resolve(data) {
        return data.get('mobilePhoneVerified');
      },
    },
    avatarUrl: {
      type: GraphQLURL,
      resolve(data) {
        return data.get('avatarUrl');
      },
    },
    addresses: {
      type: new GraphQLList(AddressType),
      resolve(data) {
        return data.get('addresses');
      },
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      resolve(data) {
        return data.get('tags');
      },
    },
    note: {
      type: GraphQLString,
      resolve(data, args, { user, roles }) {
        if (!user) return null;
        const validRoles = roles.filter(role => {
          return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
        });

        if (validRoles.length === 0) return null;
        return data.get('note');
      },
    },
    staffWorkplaces: {
      description: 'Những nơi nhân viên được sắp xếp làm việc',
      type: new GraphQLList(ShopEnumType),
      resolve(data, args, { user, roles }) {
        if (!user) return [];
        const validRoles = roles.filter(role => {
          return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
        });

        if (validRoles.length === 0) return [];
        return data.get('staffWorkplaces');
      },
    },
    staffWorkingAt: {
      description: 'Nhân viên đang làm việc tại',
      type: ShopEnumType,
      resolve(data, args, { user, roles }) {
        if (!user) return null;
        const validRoles = roles.filter(role => {
          return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
        });

        if (validRoles.length === 0) return null;
        return data.get('staffWorkingAt') || null;
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
    products: ProductQueries.products,
    productsCount: ProductQueries.productsCount,
    productTags: ProductTagQueries.productTags,
    producTagsCount: ProductTagQueries.productTagsCount,
    boxes: BoxQueries.boxes,
    boxesCount: BoxQueries.boxesCount,
    orders: OrderQueries.orders,
    ordersByCustomer: OrderQueries.ordersByCustomer,
    ordersCount: OrderQueries.ordersCount,
    users: UserQueries.users,
    searchs: SearchQueries.searchs,
    searchsCount: SearchQueries.searchsCount,
    provinces: DistrictQueries.provinces,
    districts: DistrictQueries.districts,
    wards: DistrictQueries.wards,
  }),
  interfaces: [nodeInterface],
});

RelayRegistry.registerResolverForType(User, userResolver);
export default RelayRegistry.registerNodeType(User);

