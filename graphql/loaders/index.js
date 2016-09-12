import {
  allUsersLoader,
  userByIdLoader,
  rolesByUserLoader,
  addressesByUserLoader,
} from './user';

import {
  allProductsLoader,
  productByIdLoader,
} from './product';

import {
  orderByIdLoader,
  allOrdersLoader,
  linesByOrderLoader,
} from './order';

module.exports = {
  users: allUsersLoader,
  user: userByIdLoader,
  addressesByUser: addressesByUserLoader,
  rolesByUser: rolesByUserLoader,
  product: productByIdLoader,
  products: allProductsLoader,
  order: orderByIdLoader,
  orders: allOrdersLoader,
  linesByOrder: linesByOrderLoader,
};
