import {
  connectionDefinitions,
} from 'graphql-relay';

import ShiftReportType from '../types/report';

const {
  connectionType: ShiftReportConnection,
  edgeType: ShiftReportEdge,
} = connectionDefinitions({
  nodeType: ShiftReportType,
});

export { ShiftReportConnection, ShiftReportEdge };
