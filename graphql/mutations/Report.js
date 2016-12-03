import Parse from 'parse/node';
import moment from 'moment';
import {
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';

import {
  fromGlobalId,
  mutationWithClientMutationId,
  offsetToCursor,
} from 'graphql-relay';

import { omit } from 'lodash';

import { GraphQLDateTime } from '@tranduchieu/graphql-custom-types';

import { ShiftReportEdge } from '../connections/shiftReport';
import ShiftReportType, { ShiftReportAdjustInput, ShiftReportEnumStatus } from '../types/report';
import UserType from '../types/user';

const ShiftReportCreateMutation = mutationWithClientMutationId({
  name: 'ShiftReportCreate',
  inputFields: {
    start: {
      type: new GraphQLNonNull(GraphQLDateTime),
    },
    end: {
      type: GraphQLDateTime,
    },
    itemsSold: {
      type: GraphQLInt,
      defaultValue: 0,
    },
    status: {
      type: ShiftReportEnumStatus,
      defaultValue: 'open',
    },
    revenue: {
      type: GraphQLInt,
      defaultValue: 0,
    },
    cash: {
      type: GraphQLInt,
      defaultValue: 0,
    },
    bank: {
      type: GraphQLInt,
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
    inputObj.end = moment(inputObj.end).toDate();

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

const ShiftReportUpdateMutation = mutationWithClientMutationId({
  name: 'ShiftReportUpdate',
  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    status: {
      type: ShiftReportEnumStatus,
    },
    end: {
      type: GraphQLDateTime,
    },
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
    adjust: {
      type: new GraphQLList(ShiftReportAdjustInput),
    },
    note: {
      type: GraphQLString,
    },
  },
  outputFields: {
    shiftReport: {
      type: ShiftReportType,
      resolve(shiftReport) {
        return shiftReport;
      },
    },
  },
  async mutateAndGetPayload(obj, { loaders, user, roles, accessToken }) {
    if (!user) throw new Error('Guest không có quyền cập nhật Báo cáo');

    // Check quyền admin
    const validRoles = roles.filter(role => {
      return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
    });

    if (validRoles.length === 0) throw new Error('Không có quyền cập nhật Hóa đơn');

    const { id } = fromGlobalId(obj.id);

    const shiftReportObj = await loaders.shiftReport.load(id);

    if (!shiftReportObj) {
      throw new Error(`ShiftReport id ${id} not found`);
    }

    if (shiftReportObj.get('status') === 'sent') {
      throw new Error('Không thể cập nhật Báo cáo đã gửi');
    }

    obj.end = moment(obj.end).toDate();

    Object.keys(obj).forEach(key => {
      if (key !== 'id' && key !== 'clientMutationId') shiftReportObj.set(key, obj[key]);
    });

    const shiftReportUpdated = await shiftReportObj.save(null, {
      sessionToken: accessToken, useMasterKey: true,
    });

    return shiftReportUpdated;
  },
});

export default {
  createShiftReport: ShiftReportCreateMutation,
  updateShiftReport: ShiftReportUpdateMutation,
};
