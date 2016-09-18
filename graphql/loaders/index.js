import {
  allUsersLoader,
  userByIdLoader,
  rolesByUserLoader,
  addressesByUserLoader,
} from './user';

import {
  boxByIdLoader,
  allBoxesLoader,
} from './box';

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
  box: boxByIdLoader,
  boxes: allBoxesLoader,
  product: productByIdLoader,
  products: allProductsLoader,
  order: orderByIdLoader,
  orders: allOrdersLoader,
  linesByOrder: linesByOrderLoader,
};
