import {
  allUsersLoader,
  userByIdLoader,
  userByUsernameLoader,
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
} from './order';

import {
  searchsLoader,
  searchsCountLoader,
} from './search';

import {
  salesReportLoader,
  shiftReportsLoader,
  shiftReportByIdLoader,
} from './report';

module.exports = {
  users: allUsersLoader,
  user: userByIdLoader,
  userByUsername: userByUsernameLoader,
  rolesByUser: rolesByUserLoader,
  box: boxByIdLoader,
  boxes: allBoxesLoader,
  product: productByIdLoader,
  products: allProductsLoader,
  productTag: productTagByIdLoader,
  productTags: allProductTagsLoader,
  order: orderByIdLoader,
  orders: allOrdersLoader,
  searchs: searchsLoader,
  searchsCount: searchsCountLoader,
  salesReport: salesReportLoader,
  shiftReport: shiftReportByIdLoader,
  shiftReports: shiftReportsLoader,
};
