import {
  GraphQLID,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLInputObjectType,
} from 'graphql';

import ProductType from './product';

export const OrderLineType = new GraphQLObjectType({
  name: 'OrderLine',
  description: 'OrderLine type',
  fields: {
    product: {
      type: ProductType,
      resolve(data, args, { loaders }) {
        return loaders.product.load(data.productId);
      },
    },
    unitPrice: {
      type: GraphQLInt,
    },
    quantity: {
      type: GraphQLInt,
    },
    amount: {
      type: GraphQLInt,
    },
    weight: {
      type: GraphQLInt,
    },
  },
});

export const OrderLineInputType = new GraphQLInputObjectType({
  name: 'OrderLineInput',
  fields: {
    productId: {
      type: new GraphQLNonNull(GraphQLID),
    },
    unitPrice: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    quantity: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    amount: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    weight: {
      type: GraphQLInt,
    },
  },
});
