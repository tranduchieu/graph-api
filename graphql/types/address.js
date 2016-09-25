import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLBoolean,
} from 'graphql';

import { globalIdField } from 'graphql-relay';
import { GraphQLDateTime } from '@tranduchieu/graphql-custom-types';

import RelayRegistry from '../relay/RelayRegistry';

export function addressResolver(_, { id }, { loaders }) {
  return loaders.address.load(id);
}

const Address = new GraphQLObjectType({
  name: 'Address',
  fields: {
    id: globalIdField('User'),
    fullName: {
      type: GraphQLString,
      resolve(data) {
        return data.get('fullName');
      },
    },
    company: {
      type: GraphQLString,
      resolve(data) {
        return data.get('company');
      },
    },
    address: {
      type: GraphQLString,
      resolve(data) {
        return data.get('address');
      },
    },
    ward: {
      type: GraphQLString,
      resolve(data) {
        return data.get('ward');
      },
    },
    district: {
      type: GraphQLString,
      resolve(data) {
        return data.get('district');
      },
    },
    province: {
      type: GraphQLString,
      resolve(data) {
        return data.get('province');
      },
    },
    phone: {
      type: GraphQLString,
      resolve(data) {
        return data.get('phone');
      },
    },
    isDefault: {
      type: GraphQLBoolean,
      resolve(data) {
        return data.get('isDefault');
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
  },
});

RelayRegistry.registerResolverForType(Address, addressResolver);
export default RelayRegistry.registerNodeType(Address);
