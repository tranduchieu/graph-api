import {
  allUsersLoader,
  userByIdLoader,
  rolesByUserLoader,
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
  productTagByIdLoader,
  allProductTagsLoader,
} from './productTag';

import {
  orderByIdLoader,
  allOrdersLoader,
  linesByOrderLoader,
} from './order';

import {
  orderHistoryByIdLoader,
  allOrderHistoryLoader,
} from './orderHistory';

import {
  searchsLoader,
  searchsCountLoader,
} from './search';

module.exports = {
  users: allUsersLoader,
  user: userByIdLoader,
  rolesByUser: rolesByUserLoader,
  box: boxByIdLoader,
  boxes: allBoxesLoader,
  product: productByIdLoader,
  products: allProductsLoader,
  productTag: productTagByIdLoader,
  productTags: allProductTagsLoader,
  order: orderByIdLoader,
  orders: allOrdersLoader,
  linesByOrder: linesByOrderLoader,
  orderHistoryById: orderHistoryByIdLoader,
  orderHistory: allOrderHistoryLoader,
  searchs: searchsLoader,
  searchsCount: searchsCountLoader,
};
