import {
  GraphQLID,
  // GraphQLInt,
  GraphQLBoolean,
  // GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  // GraphQLInputObjectType,
} from 'graphql';

import {
  fromGlobalId,
  mutationWithClientMutationId,
  offsetToCursor,
} from 'graphql-relay';

import Parse from 'parse/node';
import { omit } from 'lodash';

// import AddressType from '../types/address';

import { AddressEdge } from '../connections/address';
import ViewerQueries from '../queries/Viewer';

const AddressCreateMutation = mutationWithClientMutationId({
  name: 'AddressCreate',
  inputFields: {
    userId: {
      type: GraphQLID,
    },
    fullName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    company: {
      type: GraphQLString,
    },
    address: {
      type: new GraphQLNonNull(GraphQLString),
    },
    ward: {
      type: GraphQLString,
    },
    district: {
      type: new GraphQLNonNull(GraphQLString),
    },
    province: {
      type: new GraphQLNonNull(GraphQLString),
    },
    phone: {
      type: new GraphQLNonNull(GraphQLString),
    },
    isDefault: {
      type: GraphQLBoolean,
      defaultValue: false,
    },
  },
  outputFields: {
    addressEdge: {
      type: AddressEdge,
      resolve(address) {
        return {
          cursor: offsetToCursor(0),
          node: address,
        };
      },
    },
    viewer: ViewerQueries.viewer,
  },
  async mutateAndGetPayload(obj, { loaders, user, accessToken }) {
    if (!user) throw new Error('Guest không có quyền tạo Address');

    const { id: localUserId } = fromGlobalId(obj.userId);
    const address = omit(obj, ['clientMutationId', 'userId']);

    const Address = Parse.Object.extend('Address');
    const newAddress = new Address();
    const userObjById = await loaders.user.load(localUserId);

    const acl = new Parse.ACL(userObjById);
    acl.setPublicReadAccess(true);
    newAddress.setACL(acl);

    const addressObj = await newAddress.save(address, { sessionToken: accessToken });
    const relation = userObjById.relation('addresses');
    relation.add(addressObj);
    await userObjById.save(null, { sessionToken: accessToken });

    return addressObj;
  },
});

const AddressRemoveMutation = mutationWithClientMutationId({
  name: 'AddressRemove',
  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  outputFields: {
    deletedAddressId: {
      type: GraphQLID,
      resolve({ id }) {
        return id;
      },
    },
    viewer: ViewerQueries.viewer,
  },
  async mutateAndGetPayload({ id }, { loaders, user, roles, accessToken }) {
    // Check user
    if (!user) throw new Error('Guest không có quyền xóa Address');

    // Check quyền admin
    const validRoles = roles.filter(role => {
      return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
    });

    const { id: localAddressId } = fromGlobalId(id);
    const addressObjById = await loaders.address.load(localAddressId);
    if (!addressObjById) throw new Error('Address not found');

    let addressObjRemoved;
    // Nếu có quyền admin thì xóa bằng masterKey. Không thì gửi kèm sessionToken
    if (validRoles.length >= 1) {
      addressObjRemoved = await addressObjById.destroy({ useMasterKey: true });
    } else {
      addressObjRemoved = await addressObjById.destroy({ sessionToken: accessToken });
    }

    // Clear loaders
    loaders.addresses.clearAll();
    loaders.address.clear(localAddressId);

    return Object.assign({}, addressObjRemoved, { id });
  },
});

export default {
  create: AddressCreateMutation,
  remove: AddressRemoveMutation,
};
