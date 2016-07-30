import {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

import {
  globalIdField,
} from 'graphql-relay';

import moment from 'moment';


import RelayRegistry from '../relay/RelayRegistry';
import ProfileType from './profile';

// Resolver
export function accountResolver(_, { id }, { loaders }) {
  console.log('accountResolver', loaders);
  return {};
}

const MeType = new GraphQLObjectType({
  name: 'Me',
  description: 'Me type',
  fields: () => ({
    id: globalIdField('Me'),
    username: {
      type: GraphQLString,
      resolve(data) {
        return data.get('username');
      },
    },
    sessionToken: {
      type: GraphQLString,
      resolve(data) {
        return data.get('userSessionToken');
      },
    },
    expiresIn: {
      type: GraphQLInt,
      resolve(data) {
        const expiresAt = data.get('expiresAt');
        const expiresIn = moment.duration(moment(expiresAt).diff(moment())).asSeconds();
        console.log(expiresIn);
        return expiresIn;
      },
    },
    profile: {
      type: ProfileType,
      resolve(data) {
        console.log(data.get('profile'));
        return data.get('profile');
      },
    },
  }),
});

RelayRegistry.registerResolverForType(MeType, accountResolver);
export default RelayRegistry.registerNodeType(MeType);
