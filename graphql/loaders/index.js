import {
  allUsersLoader,
  userByIdLoader,
  rolesByUserLoader,
  addressesByUserLoader,
} from './user';

import {
  addressByIdLoader,
  allAddressesLoader,
} from './address';

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

module.exports = {
  users: allUsersLoader,
  user: userByIdLoader,
  addressesByUser: addressesByUserLoader,
  rolesByUser: rolesByUserLoader,
  address: addressByIdLoader,
  addresses: allAddressesLoader,
  box: boxByIdLoader,
  boxes: allBoxesLoader,
  product: productByIdLoader,
  products: allProductsLoader,
  productTag: productTagByIdLoader,
  productTags: allProductTagsLoader,
  order: orderByIdLoader,
  orders: allOrdersLoader,
  linesByOrder: linesByOrderLoader,
};
