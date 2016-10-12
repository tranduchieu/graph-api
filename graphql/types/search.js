import {
  GraphQLUnionType,
} from 'graphql';

import UserType from './user';
import ProducType from './product';
import OrderType from './order';

const resolveType = (data) => {
  if (data.className === '_User') return UserType;
  if (data.className === 'Product') return ProducType;
  if (data.className === 'Order') return OrderType;
  throw new Error('Type not found');
};

const SearchableType = new GraphQLUnionType({
  name: 'SearchableType',
  types: () => ([UserType, ProducType, OrderType]),
  resolveType,
});

export default SearchableType;
