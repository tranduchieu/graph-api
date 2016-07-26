import {
  GraphQLString,
  GraphQLObjectType
} from 'graphql';

import {
  globalIdField
} from 'graphql-relay';

import RelayRegistry from '../relay/RelayRegistry';

// Resolver
export function userResolver(_, {id}, {loaders}) {
  return loaders.user.load(id);
}

