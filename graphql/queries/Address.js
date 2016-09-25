import Parse from 'parse/node';
import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLInt,
} from 'graphql';

import {
  fromGlobalId,
  connectionArgs,
  connectionFromPromisedArray,
} from 'graphql-relay';

import AddressType from '../types/address';
import { AddressConnection } from '../connections/address';

export default {
  address: {
    type: AddressType,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve(root, { id }, { loaders, user, roles }) {
      // Check user
      if (!user) throw new Error('Guest không có quyền get Address');

      const { id: addressId } = fromGlobalId(id);
      return loaders.address.load(addressId)
      .then(addressObj => {
        if (!addressObj) throw new Error('Address not found');

        // Check quyền admin
        const validRoles = roles.filter(role => {
          return ['Boss', 'Administrator'].indexOf(role) !== -1;
        });

        if (validRoles.length === 0 &&
            !(addressObj.get('ACL').permissionsById[user.id] || {}).read) {
          throw new Error('Permission denied for action get this Address.');
        }

        return addressObj;
      });
    },
  },
  addresses: {
    type: AddressConnection,
    args: {
      ...connectionArgs,
    },
    resolve(root, args, { loaders, user, roles }) {
      if (!user) throw new Error('Guest không có quyền query Addresses');
      // Check quyền admin
      const validRoles = roles.filter(role => {
        return ['Boss', 'Administrator', 'Manager'].indexOf(role) !== -1;
      });
      if (validRoles.length === 0) throw new Error('Permission denied for action find on class Address.');

      return connectionFromPromisedArray(loaders.addresses.load(JSON.stringify(args)), {});
    },
  },
  addressesCount: {
    type: GraphQLInt,
    resolve() {
      const Address = Parse.Object.extend('Address');
      const query = new Parse.Query(Address);

      return query.count({ useMasterKey: true });
    },
  },
};
