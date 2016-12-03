/* global Parse, @flow */
import moment from 'moment';
import Promise from 'bluebird';
import loaders from '../graphql/loaders';

const shiftReportCalc = (shiftReportObj: Object) => {
  const revenue: number = shiftReportObj.get('revenue');
  const cash: number = shiftReportObj.get('cash');
  const bank: number = shiftReportObj.get('bank');
  const adjust: Array = shiftReportObj.get('adjust');

  let totalAdjust: number = 0;
  if (adjust.length > 0) {
    adjust.forEach(item => {
      if (item.type === 'add') {
        totalAdjust += item.amount;
      }
      if (item.type === 'subtract') {
        totalAdjust -= item.amount;
      }
    });
  }

  if (revenue !== (bank + (cash - totalAdjust))) {
    throw new Error('Tính toán không đúng');
  }
  return true;
};

const updateWorkingShiftReportsStatus = async (shiftReportId: string, staffObj: Object): Promise => {
  // Query report working today
  const start = moment().startOf('day').toDate();
  const end = moment().endOf('day').toDate();
  const query = new Parse.Query('ShiftReport');
  query.greaterThanOrEqualTo('createdAt', start);
  query.lessThanOrEqualTo('createdAt', end);
  query.equalTo('staff', staffObj);
  query.equalTo('status', 'working');
  const workingReports = await query.find({ useMasterKey: true });

  if (workingReports.length === 0) return Promise.resolve();
  if (workingReports.length === 1 && workingReports[0].id === shiftReportId) return Promise.resolve();

  return Promise.map(workingReports, report => {
    if (report.id === shiftReportId) return Promise.resolve();

    report.set('status', 'open');
    return report.save(null, { useMasterKey: true });
  });
};

Parse.Cloud.beforeSave('ShiftReport', (req, res) => {
  const shiftReportObj = req.object;

  // Tính toán lại
  try {
    shiftReportCalc(shiftReportObj);
  } catch (error) {
    return res.error(error.message);
  }

  return res.success();
});


Parse.Cloud.afterSave('ShiftReport', async (req, res) => {
  const shiftReportObj = req.object;

  // Check status
  const staffObj = await loaders.user.load(shiftReportObj.get('staff').id);
  if (shiftReportObj.get('status') === 'working') {
    await updateWorkingShiftReportsStatus(shiftReportObj.id, staffObj);
  }

  loaders.shiftReport.clear(shiftReportObj.id);
  loaders.shiftReports.clearAll();

  return res.success();
});
