import {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

import moment from 'moment';

import UserType from './user';

const SessionType = new GraphQLObjectType({
  name: 'SessionType',
  fields: () => ({
    sessionToken: {
      type: GraphQLString,
      resolve(data) {
        return data.get('sessionToken');
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
  }),
});

const MeType = new GraphQLObjectType({
  name: 'Me',
  description: 'Me type',
  fields: () => ({
    user: {
      type: UserType,
    },
    session: {
      type: SessionType,
    },
  }),
});

export default MeType;
