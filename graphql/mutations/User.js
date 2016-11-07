import {
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';

import {
  fromGlobalId,
  mutationWithClientMutationId,
  offsetToCursor,
} from 'graphql-relay';

import Promise from 'bluebird';

import Parse from 'parse/node';
import { omit } from 'lodash';
import nodeUUID from 'node-uuid';

import {
  GraphQLEmail,
  GraphQLURL,
  GraphQLMobilePhone,
} from '@tranduchieu/graphql-custom-types';

import UserType, { RolesEnumType } from '../types/user';
import { ShopEnumType } from '../types/enumTypes';
import { AddressInputType } from '../types/address';

import { UserEdge } from '../connections/user';

const UserCreateMutation = mutationWithClientMutationId({
  name: 'UserCreate',
  inputFields: {
    name: {
      type: GraphQLString,
    },
    username: {
      type: GraphQLString,
    },
    password: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLEmail,
    },
    mobilePhone: {
      type: GraphQLMobilePhone,
    },
    avatarUrl: {
      type: GraphQLURL,
    },
    addresses: {
      type: new GraphQLList(AddressInputType),
      defaultValue: [],
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      defaultValue: [],
    },
    note: {
      type: GraphQLString,
    },
    roles: {
      type: new GraphQLList(RolesEnumType),
    },
  },
  outputFields: {
    userEdge: {
      type: UserEdge,
      resolve(user) {
        return {
          cursor: offsetToCursor(0),
          node: user,
        };
      },
    },
    viewer: {
      type: UserType,
      resolve(root, args, { user }) {
        return user || {};
      },
    },
  },
  async mutateAndGetPayload(obj) {
    // Check roles
    if (obj.roles && obj.roles.length > 0) {
      const checkRoles = obj.roles.filter(role => {
        return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
      });

      if (checkRoles.length > 0) throw new Error('Bạn không có quyền thêm những roles: Boss, Administrator, Manager, Sales');
    }

    const userInput = omit(obj, ['clientMutationId', 'roles']);

    // Fake username, email & password
    if (!userInput.username) userInput.username = nodeUUID.v4();
    if (!userInput.email) userInput.email = `${nodeUUID.v4()}@fakemail.com`;
    if (!userInput.password) userInput.password = nodeUUID.v4();

    const newUser = new Parse.User();

    const userObjSaved = await newUser.save(userInput, { useMasterKey: true });

    // Add to role
    if (obj.roles && obj.roles.length > 0) {
      Promise.map(obj.roles, async role => {
        const roleQuery = new Parse.Query(Parse.Role);
        roleQuery.equalTo('name', role);
        const roleObj = await roleQuery.first({ useMasterKey: true });
        console.log(roleObj, userObjSaved);
        roleObj.getUsers().add(userObjSaved);
        return roleObj.save(null, { useMasterKey: true });
      });
    }

    return userObjSaved;
  },
});

const UserRemoveMutation = mutationWithClientMutationId({
  name: 'UserRemove',
  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  outputFields: {
    deleteUserId: {
      type: GraphQLID,
      resolve({ id }) {
        return id;
      },
    },
    viewer: {
      type: UserType,
      resolve(root, args, { user }) {
        return user || {};
      },
    },
  },
  async mutateAndGetPayload({ id }, { loaders, user, roles, accessToken }) {
    // Check user
    if (!user) throw new Error('Guest không có quyền xóa User');

    // Check quyền admin
    const validRoles = roles.filter(role => {
      return ['Boss', 'Administrator'].indexOf(role) !== -1;
    });
    if (validRoles.length === 0) throw new Error('Không có quyền xóa User');

    const { id: localUserId } = fromGlobalId(id);
    const userObjById = await loaders.user.load(localUserId);
    if (!userObjById) throw new Error('User not found');

    const userObjRemoved = await userObjById.destroy({ useMasterKey: true, sessionToken: accessToken });

    return Object.assign({}, userObjRemoved, { id });
  },
});

const UserUpdateMutation = mutationWithClientMutationId({
  name: 'UserUpdate',
  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: GraphQLString,
    },
    username: {
      type: GraphQLString,
    },
    password: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLEmail,
    },
    mobilePhone: {
      type: GraphQLMobilePhone,
    },
    avatarUrl: {
      type: GraphQLURL,
    },
    tags: {
      type: new GraphQLList(GraphQLString),
    },
    addresses: {
      type: new GraphQLList(AddressInputType),
    },
    note: {
      type: GraphQLString,
    },
    staffWorkplaces: {
      type: new GraphQLList(ShopEnumType),
    },
    staffWorkingAt: {
      type: ShopEnumType,
    },
  },
  outputFields: {
    user: {
      type: UserType,
      resolve(product) {
        return product;
      },
    },
  },
  async mutateAndGetPayload(obj, { loaders, user, roles, accessToken }) {
    if (!user) throw new Error('Guest không có quyền cập nhật User');

    // Check quyền admin
    const validRoles = roles.filter(role => {
      return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
    });

    const { id } = fromGlobalId(obj.id);

    if (validRoles.length === 0 && user.id !== id) {
      throw new Error('Không có quyền cập nhật User này');
    }

    const userObjById = await loaders.user.load(id);
    if (!userObjById) throw new Error('Không tìm thấy User');

    const userInput = omit(obj, ['clientMutationId', 'id']);

    Object.keys(userInput).forEach(key => {
      userObjById.set(key, userInput[key]);
    });

    const userObjUpdated = await userObjById.save(null, { sessionToken: accessToken, useMasterKey: true });

    return userObjUpdated;
  },
});

export default {
  create: UserCreateMutation,
  remove: UserRemoveMutation,
  update: UserUpdateMutation,
};
