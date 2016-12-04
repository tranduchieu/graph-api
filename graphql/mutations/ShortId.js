// @flow
import {
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';

import { mutationWithClientMutationId } from 'graphql-relay';

import { getOne, batchAdd, status } from '../../services/shortId';

// ShortId.batchAdd(20);
const ShortIdMutation = mutationWithClientMutationId({
  name: 'ShortId',
  outputFields: {
    shortId: {
      type: GraphQLString,
      resolve: (payload) => payload.shortId,
    },
  },
  async mutateAndGetPayload(args, { user }) {
    if (!user) throw new Error('Guest không có quyền get ShortId');
    const shortId = await getOne();
    return { shortId };
  },
});

const ShortIdBatchAddMutation = mutationWithClientMutationId({
  name: 'ShortIdBatchAdd',
  inputFields: {
    num: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  },
  outputFields: {
    available: {
      type: GraphQLInt,
      resolve(data) {
        return data.available;
      },
    },
    used: {
      type: GraphQLInt,
      resolve(data) {
        return data.used;
      },
    },
  },
  async mutateAndGetPayload(obj, { user }) {
    if (!user) throw new Error('Không có quyền tạo ShortId');

    try {
      await batchAdd(obj.num);
    } catch (error) {
      throw error.message;
    }

    const statusObj = await status();
    return statusObj;
  },
});

export default {
  getOne: ShortIdMutation,
  batchAdd: ShortIdBatchAddMutation,
};
