import {
  allUsersLoader,
  userByIdLoader,
  rolesByUserLoader,
} from './user';

import {
  allProfilesLoader,
  profileByIdLoader,
} from './profile';

import {
  allProductsLoader,
  productByIdLoader,
} from './product';

import {
  addressByIdLoader,
  allAddressesLoader,
  addressesByUserIdLoader,
} from './address';

import {
  orderByIdLoader,
  allOrdersLoader,
} from './order';

module.exports = {
  addresses: allAddressesLoader,
  addressesByUser: addressesByUserIdLoader,
  address: addressByIdLoader,
  users: allUsersLoader,
  user: userByIdLoader,
  rolesByUser: rolesByUserLoader,
  profiles: allProfilesLoader,
  profile: profileByIdLoader,
  product: productByIdLoader,
  products: allProductsLoader,
  order: orderByIdLoader,
  orders: allOrdersLoader,
};
