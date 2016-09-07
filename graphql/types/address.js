import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLBoolean,
} from 'graphql';

import { globalIdField } from 'graphql-relay';

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
    address: {
      type: GraphQLString,
      resolve(data) {
        return data.get('address');
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
  },
});

RelayRegistry.registerResolverForType(Address, addressResolver);
export default RelayRegistry.registerNodeType(Address);
