import {
  GraphQLString,
} from 'graphql';
import ShortParseId from '@tranduchieu/short-parse-id';

import { mutationWithClientMutationId } from 'graphql-relay';

const APP_ID = process.env.APP_ID;

const ShortId = new ShortParseId(6, APP_ID);
// ShortId.batchAdd(20);
const ShortIdMutation = mutationWithClientMutationId({
  name: 'ShortId',
  outputFields: {
    shortId: {
      type: GraphQLString,
      resolve: (payload) => payload.shortId,
    },
  },
  async mutateAndGetPayload(args, { accessToken }) {
    const shortId = await ShortId.getOne(accessToken);
    return { shortId };
  },
});

export default ShortIdMutation;
