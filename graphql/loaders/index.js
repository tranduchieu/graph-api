import {
  allUsersLoader,
  userByIdLoader,
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
  profiles: allProfilesLoader,
  profile: profileByIdLoader,
  product: productByIdLoader,
  products: allProductsLoader,
};
