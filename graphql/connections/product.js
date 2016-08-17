import {
  connectionDefinitions,
} from 'graphql-relay';

import ProductType from '../types/product';

const {
  connectionType: ProductConnection,
  edgeType: ProductEdge,
} = connectionDefinitions({
  nodeType: ProductType,
});

export { ProductConnection, ProductEdge };
