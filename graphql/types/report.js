import {
  GraphQLInt,
  GraphQLObjectType,
} from 'graphql';

export const SalesReport = new GraphQLObjectType({
  name: 'SalesReport',
  fields: () => ({
    itemsSold: {
      type: GraphQLInt,
    },
    revenue: {
      type: GraphQLInt,
    },
    cash: {
      type: GraphQLInt,
    },
    bank: {
      type: GraphQLInt,
    },
  }),
});

export const CustomersReport = new GraphQLObjectType({
  name: 'CustomersReport',
  fields: () => ({
    num: {
      type: GraphQLInt,
    },
  }),
});
