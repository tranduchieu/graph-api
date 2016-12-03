// @flow
import {
  GraphQLString,
} from 'graphql';

import { mutationWithClientMutationId } from 'graphql-relay';

import { getOne } from '../../services/shortId';

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

export default ShortIdMutation;
