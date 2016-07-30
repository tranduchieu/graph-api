import {
  GraphQLObjectType,
} from 'graphql';

import { globalIdField } from 'graphql-relay';

import UserQueries from '../queries/User';

const Viewer = new GraphQLObjectType({
  name: 'Viewer',
  description: 'Viewer query',
  fields: () => ({
    id: globalIdField('Viewer'),
    me: UserQueries.me,
    user: UserQueries.user,
    users: UserQueries.users,
  }),
});

export default Viewer;
