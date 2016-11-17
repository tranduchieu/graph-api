import moment from 'moment';
import { omit } from 'lodash';
import {
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';

import {
  fromGlobalId,
  connectionArgs,
  connectionFromPromisedArray,
} from 'graphql-relay';

import { GraphQLDateTime } from '@tranduchieu/graphql-custom-types';

import ShiftReportType, { SalesReport } from '../types/report';
import { DateRangeEnum, ShopEnumType } from '../types/enumTypes';
import { ShiftReportConnection } from '../connections/shiftReport';

export default {
  salesReport: {
    type: SalesReport,
    args: {
      dateRange: {
        type: new GraphQLNonNull(DateRangeEnum),
        defaultValue: 'today',
      },
      start: {
        type: GraphQLDateTime,
      },
      end: {
        type: GraphQLDateTime,
      },
      shops: {
        type: new GraphQLList(ShopEnumType),
      },
      staff: {
        type: GraphQLID,
      },
    },
    resolve(root, args, { loaders, user, roles }) {
      // Check roles
      if (!user) throw new Error('Guest không có quyền xem report');
      const validRoles = roles.filter(role => {
        return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
      });
      if (validRoles.length === 0) throw new Error('Không có quyền xem report');

      if (args.staff) {
        args.staff = fromGlobalId(args.staff).id;
      }

      // Check manager roles
      const validManagerRoles = roles.filter(role => {
        return ['Boss', 'Administrator', 'Manager'].indexOf(role) !== -1;
      });

      if (validManagerRoles === 0) {
        args.staff = user.id;
      }

      // Check date range
      if (args.dateRange && args.dateRange === 'custom') {
        if (!args.start || !args.end) {
          throw new Error('Không có thời điểm bắt đầu hoặc kết thúc');
        }
      }

      switch (args.dateRange) {
        case 'today':
          args.start = moment().startOf('day').toDate();
          args.end = moment().endOf('day').toDate();
          break;
        case 'yesterday':
          args.start = moment().subtract(1, 'days').startOf('day').toDate();
          args.end = moment().subtract(1, 'days').endOf('day').toDate();
          break;
        case 'lastWeek':
          args.start = moment().subtract(1, 'weeks').startOf('week').toDate();
          args.end = moment().subtract(1, 'weeks').endOf('week').toDate();
          break;
        case 'lastMonth':
          args.start = moment().subtract(1, 'months').startOf('month').toDate();
          args.end = moment().subtract(1, 'months').endOf('month').toDate();
          break;
        case 'last7Days':
          args.start = moment().subtract(7, 'days').startOf('day').toDate();
          args.end = moment().subtract(1, 'days').endOf('day').toDate();
          break;
        case 'last30Days':
          args.start = moment().subtract(30, 'days').startOf('day').toDate();
          args.end = moment().subtract(1, 'days').endOf('day').toDate();
          break;
        default:
          break;
      }

      args = omit(args, ['dateRange']);

      return loaders.salesReport.load(JSON.stringify(args));
    },
  },
  shiftReport: {
    type: ShiftReportType,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    async resolve(root, { id }, { loaders, user, roles }) {
       // Check roles
      if (!user) throw new Error('Guest không có quyền xem Báo cáo');
      const validRoles = roles.filter(role => {
        return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
      });
      if (validRoles.length === 0) throw new Error('Không có quyền xem Báo cáo');

      const { id: shiftReportId } = fromGlobalId(id);

      const shiftReportObj = await loaders.shiftReport.load(shiftReportId);
      return shiftReportObj;
    },
  },
  shiftReports: {
    type: ShiftReportConnection,
    args: {
      shops: {
        type: new GraphQLList(ShopEnumType),
      },
      skip: {
        type: GraphQLInt,
        defaultValue: 0,
      },
      limit: {
        type: GraphQLInt,
        defaultValue: 20,
      },
      ...connectionArgs,
    },
    resolve(root, args, { loaders, user, roles, staffWorkingAt }) {
      // Check roles
      if (!user) throw new Error('Guest không có quyền xem Báo cáo');
      const validRoles = roles.filter(role => {
        return ['Boss', 'Administrator', 'Manager', 'Sales'].indexOf(role) !== -1;
      });
      if (validRoles.length === 0) throw new Error('Không có quyền xem Báo cáo');

      // Check manager roles
      const validManagerRoles = roles.filter(role => {
        return ['Boss', 'Administrator', 'Manager'].indexOf(role) !== -1;
      });
      // Nếu là Sales thì chỉ xem được các báo cáo tạo bởi chính mình
      if (validManagerRoles === 0) {
        args.staff = user.id;
      }

      // Check admin roles
      const validAdminRoles = roles.filter(role => {
        return ['Boss', 'Administrator'].indexOf(role) !== -1;
      });

      // Nếu là Manager thì xem được các báo cáo của Tổ nơi làm việc
      if (validManagerRoles === 1 && validAdminRoles === 0) {
        args.shops = [staffWorkingAt];
      }

      return connectionFromPromisedArray(loaders.shiftReports.load(JSON.stringify(args)), {});
    },
  },
};
