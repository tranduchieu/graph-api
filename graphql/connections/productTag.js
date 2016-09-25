import {
  connectionDefinitions,
} from 'graphql-relay';

import ProductTagType from '../types/productTag';

const {
  connectionType: ProductTagConnection,
  edgeType: ProductTagEdge,
} = connectionDefinitions({
  nodeType: ProductTagType,
});

export { ProductTagConnection, ProductTagEdge };
