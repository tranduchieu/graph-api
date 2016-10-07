import {
  connectionDefinitions,
} from 'graphql-relay';

import SearchableType from '../types/search';

const {
  connectionType: SearchConnection,
  edgeType: SearchEdge,
} = connectionDefinitions({
  nodeType: SearchableType,
});

export { SearchConnection, SearchEdge };
