import {
  connectionDefinitions,
} from 'graphql-relay';

import UserType from '../types/user';

const {
  connectionType: UserConnection,
  edgeType: UserEdge,
} = connectionDefinitions({
  nodeType: UserType,
});

export { UserConnection, UserEdge };
