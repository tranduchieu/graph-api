import {
  GraphQLObjectType,
} from 'graphql';

import { globalIdField } from 'graphql-relay';

import UserQueries from '../queries/User';
import AddressQueries from '../queries/Address';
import ProductQueries from '../queries/Product';
import ProductTagQueries from '../queries/ProductTag';
import OrderQueries from '../queries/Order';
import BoxQueries from '../queries/Box';

const Viewer = new GraphQLObjectType({
  name: 'Viewer',
  description: 'Viewer query',
  fields: () => ({
    id: globalIdField('Viewer'),
    me: UserQueries.me,
    user: UserQueries.user,
    users: UserQueries.users,
    address: AddressQueries.address,
    addresses: AddressQueries.addresses,
    addressesCount: AddressQueries.addressesCount,
    box: BoxQueries.box,
    boxes: BoxQueries.boxes,
    boxesCount: BoxQueries.boxesCount,
    product: ProductQueries.product,
    products: ProductQueries.products,
    productsCount: ProductQueries.productsCount,
    productTag: ProductTagQueries.productTag,
    productTags: ProductTagQueries.productTags,
    producTagsCount: ProductTagQueries.productTagsCount,
    order: OrderQueries.order,
    orders: OrderQueries.orders,
    ordersByCustomer: OrderQueries.ordersByCustomer,
    ordersCount: OrderQueries.ordersCount,
  }),
});

export default Viewer;
