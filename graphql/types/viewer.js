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
    user: UserQueries.user,
    users: UserQueries.users,
  }),
});

export default Viewer;
