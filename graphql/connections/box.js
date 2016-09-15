import {
  connectionDefinitions,
} from 'graphql-relay';

import BoxType from '../types/box';

const {
  connectionType: BoxConnection,
  edgeType: BoxEdge,
} = connectionDefinitions({
  nodeType: BoxType,
});

export { BoxConnection, BoxEdge };
