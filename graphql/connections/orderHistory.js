import {
  connectionDefinitions,
} from 'graphql-relay';

import OrderHistoryType from '../types/orderHistory';

const {
  connectionType: OrderHistoryConnection,
  edgeType: OrderHistoryEdge,
} = connectionDefinitions({
  nodeType: OrderHistoryType,
});

export { OrderHistoryConnection, OrderHistoryEdge };
