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

module.exports = {
  users: allUsersLoader,
  user: userByIdLoader,
  rolesByUser: rolesByUserLoader,
  profiles: allProfilesLoader,
  profile: profileByIdLoader,
  product: productByIdLoader,
  products: allProductsLoader,
};
