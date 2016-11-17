/* global Parse, @flow */
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

  if (revenue !== (bank + (cash + totalAdjust))) {
    throw new Error('Tính toán không đúng');
  }
  return true;
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


Parse.Cloud.afterSave('ShiftReport', (req, res) => {
  const shiftReportObj = req.object;

  loaders.shiftReport.clear(shiftReportObj.id);
  loaders.shiftReports.clearAll();

  return res.success();
});
