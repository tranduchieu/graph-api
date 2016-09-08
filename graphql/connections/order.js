import {
  connectionDefinitions,
} from 'graphql-relay';

import OrderType from '../types/order';

const {
  connectionType: OrderConnection,
  edgeType: OrderEdge,
} = connectionDefinitions({
  nodeType: OrderType,
});

export { OrderConnection, OrderEdge };
