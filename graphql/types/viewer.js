import {
  GraphQLObjectType,
} from 'graphql';

import { globalIdField } from 'graphql-relay';

import UserQueries from '../queries/User';
import ProductQueries from '../queries/Product';

const Viewer = new GraphQLObjectType({
  name: 'Viewer',
  description: 'Viewer query',
  fields: () => ({
    id: globalIdField('Viewer'),
    me: UserQueries.me,
    user: UserQueries.user,
    users: UserQueries.users,
    product: ProductQueries.product,
    products: ProductQueries.products,
    productsCount: ProductQueries.productsCount,
  }),
});

export default Viewer;
