import Parse from 'parse/node';
import moment from 'moment';
import {
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';

import {
  mutationWithClientMutationId,
  offsetToCursor,
} from 'graphql-relay';

import { omit } from 'lodash';

import { GraphQLDateTime } from '@tranduchieu/graphql-custom-types';

import { ShiftReportEdge } from '../connections/shiftReport';
import { ShiftReportAdjustInput, ShiftReportEnumStatus } from '../types/report';
import UserType from '../types/user';

const ShiftReportMutation = mutationWithClientMutationId({
  name: 'ShiftReportCreate',
  inputFields: {
    start: {
      type: new GraphQLNonNull(GraphQLDateTime),
    },
    end: {
      type: new GraphQLNonNull(GraphQLDateTime),
    },
    itemsSold: {
      type: new GraphQLNonNull(GraphQLInt),
      defaultValue: 0,
    },
    status: {
      type: new GraphQLNonNull(ShiftReportEnumStatus),
      defaultValue: 'open',
    },
    revenue: {
      type: new GraphQLNonNull(GraphQLInt),
      defaultValue: 0,
    },
    cash: {
      type: new GraphQLNonNull(GraphQLInt),
      defaultValue: 0,
    },
    bank: {
      type: new GraphQLNonNull(GraphQLInt),
      defaultValue: 0,
    },
    adjust: {
      type: new GraphQLList(ShiftReportAdjustInput),
      defaultValue: [],
    },
    note: {
      type: GraphQLString,
    },
  },
  outputFields: {
    shiftReportEdge: {
      type: ShiftReportEdge,
      resolve(shiftReport) {
        return {
          cursor: offsetToCursor(0),
          node: shiftReport,
        };
      },
    },
    viewer: {
      type: UserType,
      resolve(root, args, { user }) {
        return user || {};
      },
    },
  },
  async mutateAndGetPayload(inputObj, { user, roles, staffWorkingAt }) {
    // Check roles
    if (!user) throw new Error('Guest không có quyền tạo Báo cáo');
    const validRoles = roles.filter(role => {
      return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
    });
    if (validRoles.length === 0) {
      throw new Error('Không có quyền tạo Báo cáo');
    }

    inputObj = omit(inputObj, ['clientMutationId']);
    inputObj.staff = user;
    inputObj.shop = staffWorkingAt;
    inputObj.start = moment(inputObj.start).toDate();
    inputObj.end = moment(inputObj).toDate();

    const ShiftReport = Parse.Object.extend('ShiftReport');
    const newShiftReport = new ShiftReport();

    const acl = new Parse.ACL(user);
    newShiftReport.setACL(acl);

    const shiftReportSaved = await newShiftReport.save(inputObj, {
      useMasterKey: true,
    });

    return shiftReportSaved;
  },
});

export default {
  createShiftReport: ShiftReportMutation,
};
