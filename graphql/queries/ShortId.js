import {
  GraphQLString,
} from 'graphql';
import ShortParseId from '@tranduchieu/short-parse-id';

const APP_ID = process.env.APP_ID;

const ShortId = new ShortParseId(6, APP_ID);
// ShortId.batchAdd(20);

export default {
  type: GraphQLString,
  resolve() {
    return ShortId.getOne();
  },
};
