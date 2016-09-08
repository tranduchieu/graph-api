import {
  connectionDefinitions,
} from 'graphql-relay';

import AddressType from '../types/address';

const {
  connectionType: AddressConnection,
  edgeType: AddressEdge,
} = connectionDefinitions({
  nodeType: AddressType,
});

export { AddressConnection, AddressEdge };
