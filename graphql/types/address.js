import {
  GraphQLID,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInputObjectType,
} from 'graphql';

export const AddressType = new GraphQLObjectType({
  name: 'Address',
  description: 'Address Type',
  fields: {
    id: {
      type: GraphQLID,
    },
    fullName: {
      type: GraphQLString,
    },
    company: {
      type: GraphQLString,
    },
    address: {
      type: GraphQLString,
    },
    ward: {
      type: GraphQLString,
    },
    district: {
      type: GraphQLString,
    },
    province: {
      type: GraphQLString,
    },
    phone: {
      type: GraphQLString,
    },
  },
});

export const AddressInputType = new GraphQLInputObjectType({
  name: 'AddressInput',
  fields: {
    id: {
      type: GraphQLID,
    },
    fullName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    company: {
      type: GraphQLString,
    },
    address: {
      type: new GraphQLNonNull(GraphQLString),
    },
    ward: {
      type: new GraphQLNonNull(GraphQLString),
    },
    district: {
      type: new GraphQLNonNull(GraphQLString),
    },
    province: {
      type: new GraphQLNonNull(GraphQLString),
    },
    phone: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});
